const MasterContract = require('../contracts/MasterContract.json')
const e2e = require('./e2e-encrypt.js')
const wallet = require('wallet-besu')
const getWeb3 = require('../getWeb3.js')
const fileDownload = require('js-file-download')
const Web3 = require('web3')

let web3, id, deployedNetwork, contract,accounts,fromUser

const init = async function() {
    console.log("Deploying contract")
    web3 = await getWeb3.default()
    accounts = await web3.eth.getAccounts()
    fromUser = accounts[0]
    console.log(accounts)
    id = await web3.eth.net.getId()
    deployedNetwork = MasterContract.networks[id]
    contract = new web3.eth.Contract(
        MasterContract.abi, deployedNetwork.address
    )
    return fromUser
}

const registerUser = async function(name, email, privateKey){
    try {
        let publicKey = e2e.getPublicKey(privateKey)
        publicKey = publicKey.toString("hex")
        const receipt = await contract.methods.registerUser(
            name, email, publicKey
        ).send({
            from: fromUser,
            gas: 300000
        })

        if (receipt.status)
            return receipt.from
        return null
    }catch(err){
        throw err
    }
}

const createWallet = async function(password){
    return await wallet.create(password,"orion key1")
}

const getAllAccounts = async function(password){
    return await wallet.login(password)
}

const loginUser = async function(privateKey){
    try {
        let publicKey = e2e.getPublicKey(privateKey)
        publicKey = publicKey.toString("hex")
        await contract.methods.updatePublicKey(publicKey).send({
            from: fromUser,
            gas: 3000000
        })
        return true
    }catch (err) {
        throw err
    }
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

const uploadFile = async function(party, file, password, setSubmitting){

    console.log("party:",party)
    let encryptedKeys=[]
    let userAddress=[]
    const cipherKey = await e2e.generateCipherKey(password)

    let reader = new FileReader()
    reader.readAsArrayBuffer(file)

    reader.onload = async (val) => {
        const fileInput = val.target.result
        const encryptFile = await e2e.encryptFile(fileInput,cipherKey)
        const fileHash = e2e.calculateHash(fileInput)

        for (let i=0;i<party.length;i++){
            let aesEncKey = await e2e.encryptKey(Buffer.from(party[i].key,"hex"), cipherKey)
            let storeKey = {
                iv: aesEncKey.iv.toString("hex"),
                ephemPublicKey: aesEncKey.ephemPublicKey.toString("hex"),
                ciphertext: aesEncKey.ciphertext.toString("hex"),
                mac: aesEncKey.mac.toString("hex")
            }
            encryptedKeys.push(JSON.stringify(storeKey))
            userAddress.push(party[i].address)
        }

        //Save the encrypted file to AWS
        return await contract.methods.uploadDocument(
            42,
            fileHash.toString("hex"),
            'File location',
            encryptedKeys,
            userAddress
        ).send({
            from: fromUser,
            gas:3000000
        }).then((receipt)=>{setSubmitting(false)})
    }
}

const getAllFile = async function(){
    return await contract.methods.getAllDocIndex().call({
        from: fromUser
    })
}

const downloadFile = async function (docIndex){

    let cipherKey = await contract.methods.getCipherKey(docIndex).call({
        from: fromUser
    })
    cipherKey = JSON.parse(cipherKey)
    const document = await contract.methods.getDocument(docIndex).call({
        from: fromUser
    })
    let encryptedKey = {
        iv: Buffer.from(cipherKey.iv,"hex"),
        ephemPublicKey: Buffer.from(cipherKey.ephemPublicKey,"hex"),
        ciphertext: Buffer.from(cipherKey.ciphertext,"hex"),
        mac: Buffer.from(cipherKey.mac,"hex")
    }
    //console.log("encryptedKey:",encryptedKey)
    const privateKey = await wallet.login("alice");
    const decryptedKey = await e2e.decryptKey(privateKey[0],encryptedKey)
    // get the file from aws
    // let encryptedData
    // const decryptedFile = await e2e.decryptFile(encryptedData,decryptedKey)
    // download the file
    //fileDownload(decryptedFile.toString(),"result.txt")
    return decryptedKey
}

module.exports ={
    registerUser,
    createWallet,
    loginUser,
    getAllAccounts,
    getAllUsers,
    uploadFile,
    getAllFile,
    downloadFile,
    init
}

