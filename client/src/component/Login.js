import React, {Component} from 'react'
const index = require('../lib/index.js')

class Login extends Component {

    state = {
        keys:[],
        account:''
    }

    componentDidMount = async ()=> {
        await index.init()
        index.getAllAccounts().then((result) => {
            this.setState({
                keys:result,
                account:result[0]
            })
        })
    }

    onAccountChange = (event) => this.setState({account:event.target.value})

    handleLogin = (event) => {
        console.log(this.state.account)
        index.loginUser(this.state.account).then(()=>{
            alert("User logged In")
            window.location.replace("http://localhost:3000/home");
        })
    }

    render() {
        return (
            <div className="login">
                <h1>Welcome back Alien :)</h1>
                <h3>Select Account to Login:</h3>
                <select onChange={this.onAccountChange}>
                    {this.state.keys.map((key) => <option value={key} key={key}>{key}</option>)}
                </select><br/>
                <button id="login-btn" onClick={this.handleLogin}>Login</button>

                {/*Add account goes here*/}
            </div>
        )
    }
}

export default Login
