import React, {useEffect, useState} from 'react'
import {Button, Dropdown, Grid, Header, Icon} from 'semantic-ui-react'
import jenny from '../images/jenny.jpg'
const index = require('../lib/index.js')

export default function Dashboard() {

    const user = localStorage.getItem('USER')
    const loggedUser = JSON.parse(user)

    const [users, setUsers] = useState([])
    const [destUser, setDestUser] = useState('')
    const [file, selectFile] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [dbClient,setDBClient] = useState(null)
    const [identity, setIdentity] = useState(null)

    let fileInputRef = React.createRef();

    const fileTypes = {
        'application/pdf': 'pdf',
        'image/png': 'image',
        'image/jpeg': 'image',
        'application/vnd.ms-excel': 'excel',
        'application/zip': 'archive'
    }

    useEffect(() => {
        index.init().then((result) => {
            setDBClient(result.client)
            setIdentity(result.identity)
            index.getAllUsers(result.client,loggedUser.email).then((registeredUser)=>{
                console.log("USERSS:",registeredUser)
                if (registeredUser.length>0){
                    setUsers(registeredUser)
                }
            })
        })
    }, [])

    const uploadFile = async () => {
        let partiesInvolved = []
        setSubmitting(true)
        for (let userIndex = 0; userIndex < users.length; userIndex++) {
            if (destUser.toLowerCase() === users[userIndex].email.toLowerCase()) {
                partiesInvolved.push(users[userIndex])
            }
        }
        partiesInvolved.push({email:loggedUser.email,_id:loggedUser._id})
        const receipt = await index.uploadFile(partiesInvolved, file, setSubmitting, dbClient)
        console.log("File uploaded!", receipt)
    }


    return (

        <Grid textAlign='center' style={{height: '20vh', padding: '10vh', justifyContent: 'center'}}
              verticalAlign='middle'>
            <Grid.Column style={{maxWidth: 300}}>
                <Dropdown
                    style={{margin: '0.2rem'}}
                    placeholder='Select a Party'
                    fluid
                    selection
                    options={users.map((user) => {
                        return (
                            {
                                key: user.email,
                                text: user.name,
                                value: user.email,
                                image: {avatar: true, src: jenny},
                            }
                        )

                    })}
                    onChange={(event, data) => setDestUser(data.value)}
                />

                <Header icon>
                    <Icon name={`file ${fileTypes[file.type]} outline`}/>
                    {file.type ? file.name : 'Select a file to share'}.
                </Header>

                <Button type="file" primary style={{margin: '4rem'}} onClick={() => fileInputRef.current.click()}>
                    Select Document<input ref={fileInputRef} type="file" hidden onChange={(event) => {
                    selectFile(event.target.files[0])
                }}></input>
                </Button>
                <Button loading={submitting} positive style={{margin: '4rem'}} onClick={uploadFile}>Share file</Button>
            </Grid.Column>
        </Grid>
    )

}
