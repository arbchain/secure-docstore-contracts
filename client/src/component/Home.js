import React, { Component } from 'react'
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const index = require('../lib/index.js')

class Home extends Component {

    state = {
        users:[],
        loggedUser:null,
        partySelected:'',
        fileSelected:null,
        doc:[],
        documentSelected:''
    }

    componentDidMount = async() => {
        await index.init()
        const loggedUser = cookies.get("userAddress")
        index.getAllUsers(loggedUser).then(result =>{
            console.log("Registered users:",result)
            if(result.userArray.length > 0) {
                this.setState({
                    users: result.userArray,
                    partySelected: result.userArray[0].address,
                    loggedUser:result.caller
                })
            }
        })
    }

    onPartyChange = (event) => this.setState({ partySelected: event.target.value })
    onFileSelect = (event)=> this.setState({fileSelected: event.target.files[0]})

    uploadFile = async ()=>{
        let partiesInvolved = []
        for (let i=0;i<this.state.users.length;i++) {
            if (this.state.partySelected.toLowerCase()===this.state.users[i].address.toLowerCase()){
                partiesInvolved.push(this.state.users[i])
            }
        }
        partiesInvolved.push(this.state.loggedUser)
        await index.uploadFile(partiesInvolved,this.state.fileSelected)
        alert("File uploaded!")
    }

    showDocument = async () => {
        const doc = await index.getAllFile()
        this.setState({
            doc:doc
        })
        console.log("doc:",doc)
    }

    onDocumentSelect = (event) => this.setState({documentSelected: event.target.value})

    getDocument = async () => {
        console.log(this.state.documentSelected)
        await index.downloadFile(this.state.documentSelected)
        alert("File downloaded!")
    }

    render() {
        return (
            <div className="home">
                <div className="home-header">
                    <h1>Welcome to Home Page :)</h1>
                </div>
                <div className="home-content">
                    <label>Select Party:</label>
                    <select className="select-area" onChange={this.onPartyChange}>
                        {this.state.users.map((key) => <option value={key.address} key={key.address}>{key.name}</option>)}
                    </select><br/>
                    <label>Select Document:</label>
                    <input type="file" onChange={this.onFileSelect} /><br/>
                    <button className="share-doc-btn" onClick={this.uploadFile}>Share Document</button>
                </div>
                <div className="file-content">
                    <label>File Shared:</label>
                    <button className="file-details" onClick={this.showDocument}>Show Document</button><br/>
                    <select className="select-area" onChange={this.onDocumentSelect}>
                        {this.state.doc.map((doc) => <option value={doc} key={doc}>{"Document "+doc}</option>)}
                    </select><br/><br/>
                    <button className="share-doc-btn" onClick={this.getDocument}>Download Document</button><br/>
                </div>
            </div>
        )
    }
}

export default Home
