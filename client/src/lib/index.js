const e2e = require('./e2e-encrypt.js')
const getWeb3 = require('../getWeb3.js')
const fileDownload = require('js-file-download')
const {PrivateKey, createUserAuth, Client, Where, ThreadID} = require('@textile/hub')
const fleekStorage = require('@fleekhq/fleek-storage-js')
let fromUser

const keyInfo = {
    key:'be645tj5wtjuginby3fwnqhe57y',
    secret:'bcm7zjaxlipajgsm6qd6big7lv52cihf2whbbaji'
}

const threadDbId = [1, 85, 243, 59, 153, 95, 17, 179, 45, 75, 50, 151, 93, 179, 250, 124, 102,
    28, 126, 156, 20, 70, 225, 244, 240, 2, 64, 85, 160, 242, 198, 180, 46, 56]

const fleekApiKey = "t8DYhMZ1ztjUtOFC8qEDqg=="
const fleekApiSecret = "XwZyU7RZ3H2Z1QHhUdFdi4MJx8j1axJm2hEq1olRWeU="

const init = async function() {
    const web3 = await getWeb3.default()
    const accounts = await web3.eth.getAccounts()
    fromUser = accounts[0]
    const identity = await generateIdentity()
    const dbClient = await setThreadDb(identity)
    return {
        fromUser: fromUser,
        client: dbClient,
        identity: identity
    }
}

const generateIdentity = async () => {
    const seed = fromUser.substring(0,32)
    console.log("seed:",seed)
    const seedPhase = new Uint8Array(Buffer.from(seed))
    const identity = PrivateKey.fromRawEd25519Seed(seedPhase)
    console.log("identity generated!!",identity)
    return identity
}

const setThreadDb = async (identity)=>{
    const userAuth = await createUserAuth(keyInfo.key,keyInfo.secret)
    const privateKey = await PrivateKey.fromString(identity.toString())
    const dbClient = await Client.withUserAuth(userAuth)
    const token = await dbClient.getToken(privateKey)
    console.log("ThreadDB setup done!!!")
    return dbClient
}

const storeFileFleek = async (fileName,encryptedData)=>{
    return await fleekStorage.upload({
        apiKey: fleekApiKey,
        apiSecret: fleekApiSecret,
        key: fileName,
        data: encryptedData
    })
}

const getFileFleek = async (fileName)=>{
    const file = await fleekStorage.get({
        apiKey: fleekApiKey,
        apiSecret: fleekApiSecret,
        key: fileName
    })
    return file.data
}

const registerUser = async function(name, email,password,identity,dbClient){
    try {
        const query = new Where('email').eq(email)
        const threadId = ThreadID.fromBytes(threadDbId)
        const result = await dbClient.find(threadId, 'RegisterUser', query)
        if (result.length>0) {
            console.log("Email exists!")
            return false
        }
        const hashPass = e2e.calculateHash(password)
        const data = {
            name: name,
            email: email,
            password: hashPass,
            publicKey: identity.public.toString(),
            documentId: ["-1"]
        }
        const insertStatus = await insertData(dbClient,data,'RegisterUser')
        console.log("User registration status:",insertStatus)
        return insertStatus
    }catch(err){
        throw err
    }
}

const insertData = async (dbClient,data,schemaName) =>{
    const threadId = ThreadID.fromBytes(threadDbId)
    const insertStatus = await dbClient.create(threadId, schemaName, [data])
    console.log("Insert Data status:",insertStatus)
    return true
}

const loginUser = async function(email,password,identity,dbClient){
    try {
        const hashPass = e2e.calculateHash(password)
        const query = new Where('email').eq(email)
        const threadId = ThreadID.fromBytes(threadDbId)
        const result = await dbClient.find(threadId, 'RegisterUser', query)
        console.log("RESULT:",result)
        if (result.length<1){
            console.log("Please register user!")
            return null
        }
        if (result[0].password!==hashPass){
            console.log("Wrong pass!!")
            return null
        }
        return result[0]._id
    }catch (err) {
        throw err
    }
}

const getAllUsers = async function(dbClient,loggedUser){
    console.log("Logg:",loggedUser)
    const query = new Where('email').ne(loggedUser)
    const threadId = ThreadID.fromBytes(threadDbId)
    const registeredUsers = await dbClient.find(threadId, 'RegisterUser', query)
    console.log("Registered user:",registeredUsers)
    return registeredUsers
}

const uploadFile = async function(parties, file, setSubmitting, dbClient){
    console.log("Uploading File!!!")
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = async (val) => {
        const fileInput = new Uint8Array(val.target.result)
        const cipherKey = await e2e.generateCipherKey("password")
        const encryptedFile = await e2e.encryptFile(Buffer.from(fileInput), cipherKey)
        const fileHash = e2e.calculateHash(fileInput)
        let fileKey = fileHash.toString("hex").concat(".").concat("FLEEK")
        const threadId = ThreadID.fromBytes(threadDbId)
        let keys = []
        for (let i=0; i<parties.length; i++){
            const json ={
                email: parties[i].email,
                key : cipherKey.toString("hex")     //encrypted key for every party
            }
            keys.push(json)
        }
        await storeFileFleek(fileKey,encryptedFile)
        const status = await dbClient.create(threadId, 'Document', [{
            fileLocation: fileKey,
            fileName: file.name,
            key: keys
        }])

        for (let i=0; i<parties.length; i++){
            const query = new Where('email').eq(parties[i].email)
            const user = await dbClient.find(threadId, 'RegisterUser', query)
            if (user[0].documentId.length===1 && user[0].documentId[0]==="-1"){
                user[0].documentId = [status[0]]
            }else {
                user[0].documentId.push(status[0])
            }
            await dbClient.save(threadId,'RegisterUser',[user[0]])
            console.log("Updated!!:")
        }
        console.log("File uploaded!!!")
        setSubmitting(false)
    }
}

const getAllFile = async function(dbClient, loggedUser){
    const threadId = ThreadID.fromBytes(threadDbId)
    const query = new Where('email').eq(loggedUser)
    const documents = await dbClient.find(threadId, 'RegisterUser', query)
    console.log('Result:', documents)
    return documents[0].documentId
}

const downloadFile = async function (docIndex, dbClient, loggedUser){
    const threadId = ThreadID.fromBytes(threadDbId)
    const documents = await dbClient.findByID(threadId, 'Document', docIndex)
    const fileName = documents.fileName
    const fileLocation = documents.fileLocation
    const keys = documents.key
    let cipherKey = null
    for (let i=0;i<keys.length;i++){
        if (keys[i].email===loggedUser){
            cipherKey = Buffer.from(keys[i].key,"hex")
            break;
        }
    }
    const encryptedData = await getFileFleek(fileLocation)
    const decryptedData = await e2e.decryptFile(encryptedData,cipherKey)
    console.log("DecryptedFile:",decryptedData)
    fileDownload(decryptedData,fileName)
    return true
}

module.exports ={
    registerUser,
    loginUser,
    getAllUsers,
    uploadFile,
    getAllFile,
    downloadFile,
    init
}

