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
        const receipt = await contractInstance.registerUser("PartyA","a@gmail.com", "publicKeyPartyB",{
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

})
