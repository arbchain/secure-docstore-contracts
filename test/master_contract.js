const MasterContract = artifacts.require('./MasterContract.sol')

contract("MasterContract",  (accounts) => {
    let contractInstance=null

    it('Should deploy contract', async () => {
        contractInstance = await MasterContract.deployed()
        assert(contractInstance!=null)
    });

    it('Should register PartyA', async () => {
        const receipt = await contractInstance.registerUser("PartyA","a@gmail.com", "publicKeyPartyA",{
            from:accounts[1]
        })
        assert.equal(true, receipt.receipt.status)
    })

    it('Should  register PartyB', async () =>{
        const receipt = await contractInstance.registerUser("PartyA","a@gmail.com", "publicKeyPartyA",{
            from:accounts[2]
        })
        assert.equal(true, receipt.receipt.status)
    });

    it('Should get all users', async () =>{
        const users = await contractInstance.getAllUsers({
            from:accounts[0]
        })
        assert.equal(2, users.length)
    });

    it('Should update public key of PartyA', async() => {
        const status = await contractInstance.updatePublicKey("publicKeyPartyA",{
            from: accounts[1]
        })
        assert.equal(true, status.receipt.status)
    });

    it('Should update public key of PartyB', async() => {
        const status = await contractInstance.updatePublicKey("publicKeyPartyB",{
            from: accounts[2]
        })
        assert.equal(true, status.receipt.status)
    });

    //PartyB getting PartyA public key for encryption
    it('Should get partyA public key', async() => {
        const publicKey = await contractInstance.getPublicKey(accounts[1],{
            from: accounts[2]
        })
        assert.equal("publicKeyPartyA", publicKey)
    });

    it('Should share document between PartyA and PartyB', async() => {
        const document = await contractInstance.uploadDocument(
            42,
            "doc Hash",
            "doc location",
            ["AesEncKeyPartyA","AesEncKeyPartyB"],
            [accounts[1],accounts[2]],{
                from:accounts[2]
            })
        assert.equal(true, document.receipt.status)
    });

    it('Should get all document for PartyA', async() => {
        const document = await contractInstance.getAllDocIndex({
            from:accounts[1]
        })
        assert.equal(1, document.length)
    });

    it('Should get specific document', async() => {
        const document = await contractInstance.getDocument(0)
        assert.equal(2, document.users.length)
        assert.equal(2, document.key.length)
        assert.equal(42, document.caseId)
        assert.equal('doc location', document.documentLocation)
        assert.equal('doc Hash', document.documentHash)
    });

    it('Should get AesEncKey for PartyA for document 0', async () => {
        const cipherKey = await contractInstance.getCipherKey(0,{
            from:accounts[1]
        })
        assert.equal('AesEncKeyPartyA', cipherKey)
    });

})
