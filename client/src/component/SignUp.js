import React, {Component} from 'react'
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const index = require('../lib/index.js')

class Signup extends Component{

    constructor(props){
        super(props)
        this.state = {
            name:'',
            email:''
        }
    }

    componentDidMount = async() => await index.init()

    submitForm = async (event) =>{
        event.preventDefault()
        const registrationStatus = await index.registerUser(this.state.name, this.state.email)
        if (registrationStatus!=null){
            const walletStatus = await index.createWallet()
            if (walletStatus) {
                cookies.set('userAddress', registrationStatus);
                //console.log(cookies.get('myCat'));
                alert("User registered and wallet created!")
                window.location.replace("http://localhost:3000/login");
            }
            else
                alert("Cannot create wallet!")
        }
    }

    changeName = (event) => this.setState({name: event.target.value});
    changeEmail = (event) => this.setState({email: event.target.value});

    render(){
        return (
            <form onSubmit={this.submitForm}>
                <div className='signup'>
                    <h1>Welcome Alien :) </h1>
                    <input type="text" placeholder="Name" onChange={this.changeName} id="name" required/><br/>
                    <input type="email" placeholder="Email" onChange={this.changeEmail} id="email" required/><br/>
                    <input type="submit" value="Submit" />
                </div>
            </form>
        )
    }

}

export default Signup
