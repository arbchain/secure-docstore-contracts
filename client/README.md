## Example 

A simple react application demonstrating how to 
integrate wallet, e2e encryption and smart-contract with
front-end.

### Integrations 
1. Integrated SignUp with wallet-creation and contract
2. Integrated Login with wallet and contract
3. Integrated document upload and download with e2e encryption
and smart-contract

### Note
1. Need two register two users to check file sharing. For this use
two different browsers. 
2. Used web3 instead of MetaMask to make transactions. Hence, have to 
make some changes in **client/src/lib/index.js** file

### Quick Start
1. cd secure-docstore-contracts
2. truffle develop
3. migrate --reset
4. cd client
5. npm start
6. Register first user:
    1. Set **userFrom = accounts[0]** in **client/src/lib/index.js**.
    2. Go to browser-> Register user-> Login user
7. Register second user:
    1. Open new browser and open React application
    2. Set **userFrom = accounts[1]** in **client/src/lib/index.js**.
    3. Go to browser-> Register user-> Login user
    4. Here you can see the first user
    5. Refresh the first browser to see the second user their
8. Share document:
    1. Set **userFrom = accounts[0]** in **client/src/lib/index.js**
    and return back to first browser.
    2. Click on choose file->upload file
    3. File will be uploaded.
    4. Then click on **Show document**, and you will see all the documents.
9. Download document for first user:
    1. Select the document and click on **Download Document**
    2. You can see the decrypted AES key on console.
10. Download document for second user:
    1. Set **userFrom = accounts[1]** in **client/src/lib/index.js**
    and return back to second browser.
    1. Select the document and click on **Download Document**
    2. You can see the decrypted AES key on console.

