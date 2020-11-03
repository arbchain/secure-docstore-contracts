pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

contract MasterContract {

    struct UserSchema {
        string name;
        string email;
        bool status;
        string publicKey;
    }

    // Map to store all the registered users
    mapping(address=>UserSchema) public storeUser;

    // array to store registered users address
    address[] registeredUsers;

    /**
     * @dev Register User
     * @param userName: User Name
     * @param userEmail: User mail id
     */
    function registerUser(
        string memory userName,
        string memory userEmail,
        string memory publicKey
    ) public{
        require(!storeUser[msg.sender].status, "Should not be registered before!");

        storeUser[msg.sender].name = userName;
        storeUser[msg.sender].email = userEmail;
        storeUser[msg.sender].publicKey = publicKey;
        storeUser[msg.sender].status = true;
        registeredUsers.push(msg.sender);
    }

    function getAllUsers() public view returns(address[] memory users){
        return registeredUsers;
    }

}
