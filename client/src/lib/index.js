const MasterContract = require('../contracts/MasterContract.json')
const getWeb3 = require('../getWeb3.js')
const fileDownload = require('js-file-download')
const {PrivateKey,Users,PublicKey} = require('@textile/hub')

let web3, id, deployedNetwork, contract,accounts,fromUser

const keyInfo = {
    key:'be645tj5wtjuginby3fwnqhe57y',
    secret:'bcm7zjaxlipajgsm6qd6big7lv52cihf2whbbaji'
}

const init = async function() {
    web3 = await getWeb3.default()
    accounts = await web3.eth.getAccounts()
    fromUser = accounts[0]
    id = await web3.eth.net.getId()
    deployedNetwork = MasterContract.networks[id]
    contract = new web3.eth.Contract(
        MasterContract.abi, deployedNetwork.address
    )
    console.log("fromUser:",fromUser)
    return fromUser
}

const generateIdentity = async () => {
    const seed = fromUser.substring(0,32)
    console.log("seed:",seed)
    const seedPhase = new Uint8Array(Buffer.from(seed))
    const identity = PrivateKey.fromRawEd25519Seed(seedPhase)
    console.log("identity generated!!",identity)
    return identity
}

const initializeMailBox = async (userIdentity)=>{
    const identity = PrivateKey.fromString(userIdentity)
    const user = await Users.withKeyInfo(keyInfo)
    await user.getToken(identity)
    await user.setupMailbox()
    console.log("Mailbox initialled!!!:")
    return user
}

const uploadFile = async (partiesInvolved, file, identity, setSubmitting,user) => {
    console.log("File:", file.name)
    const userIdentity = PrivateKey.fromString(identity)
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = async (val) => {
        console.log("FiLE:",val.target.result)
        const fileInput = new Uint8Array(val.target.result)
        console.log("FileInput:",fileInput)
        for (let i=0; i<partiesInvolved.length; i++){
            const recipientKey = PublicKey.fromString(partiesInvolved[i].key)
            const result = await user.sendMessage(userIdentity, recipientKey, fileInput)
            console.log("result1:",result)
        }
        const result2 = await user.sendMessage(userIdentity, userIdentity.public, fileInput)
        console.log("Result:",result2)
        setSubmitting(false)
    }
}

const getAllFiles = async (user)=>{
    console.log("users:",user)
    let messages = await user.listInboxMessages()
    messages = messages.reverse()
    console.log("Messages1:", messages)
    console.log("Mail Box Initialized")
    return messages
}

const downloadFile = async function(document, identity){
    console.log("document:",document)
    const userIdentity = PrivateKey.fromString(identity)
    const bytes = await userIdentity.decrypt(document.body)
    console.log("Bytes:",bytes)
    fileDownload(bytes,"res")
    return true
}

const getAllUsers = async function(loggedUser){
    const registeredUsers = await contract.methods.getAllUsers().call({
        from: fromUser
    })
    let caller
    let userArray = []
    for (let i = 0; i < registeredUsers.length; i++){
        const result = await contract.methods.storeUser(registeredUsers[i]).call({
            from: fromUser
        });
        if (loggedUser.toLowerCase()!==registeredUsers[i].toLowerCase()) {
            const value = {
                address: registeredUsers[i],
                name: result.name,
                key: result.publicKey,
            }
            userArray.push(value)
        }else{
            caller ={
                address: registeredUsers[i],
                name: result.name,
                key: result.publicKey,
            }
        }
    }
    const userDetails = {
        userArray:userArray,
        caller:caller
    }
    return userDetails
}

const registerUser = async function(name, email){
    try {
        const identity = await generateIdentity()
        const receipt = await contract.methods.registerUser(
            name, email, identity.public.toString()
        ).send({
            from: fromUser,
            gas: 300000
        })
        if (receipt.status)
            return true
        return null
    }catch(err){
        throw err
    }
}

const loginUser = async function(){
    return await generateIdentity()
}

module.exports ={
    registerUser,
    loginUser,
    getAllFiles,
    getAllUsers,
    uploadFile,
    downloadFile,
    initializeMailBox,
    init
}