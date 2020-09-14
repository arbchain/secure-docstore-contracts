import React, {useEffect, useState} from 'react'
import { Button, Dropdown, Grid, Header, Icon, Input} from 'semantic-ui-react'

import jenny from '../images/jenny.jpg'
import elliot from '../images/elliot.jpg'

const index = require('../lib/index.js')

export default function Dashboard() {

    const password = localStorage.getItem('password')

    const [users, setUsers] = useState([])
    const [caller, setCaller] = useState(null)
    const [destUser, setDestUser] = useState('')
    const [file, selectFile] = useState({})
    const [submitting, setSubmitting] = useState(false)

    let fileInputRef = React.createRef();

    const fileTypes = {'application/pdf': 'pdf',
                        'image/png': 'image',
                        'image/jpeg': 'image',
                        'application/vnd.ms-excel': 'excel',
                         'application/zip': 'archive'}

    useEffect(() => {
         index.init().then((fromUser)=> {
         index.getAllUsers(fromUser).then(result =>{
            console.log("Registered users:",result)
            if(result.userArray.length > 0) {
                setUsers(result.userArray)
                setCaller(result.caller)
            }
        })

         })

    }, [] )

    const uploadFile = async ()=>{
        let partiesInvolved = []

        setSubmitting(true)
        for (let userIndex=0; userIndex<users.length; userIndex++) {
            if (destUser.toLowerCase() === users[userIndex].address.toLowerCase()){
                partiesInvolved.push(users[userIndex])
            }
        }
        partiesInvolved.push(caller)
        const receipt  = await index.uploadFile(partiesInvolved, file, password, setSubmitting)
        console.log("File uploaded!", receipt)
    }


    return(

        <Grid textAlign='center' style={{ height: '20vh', padding: '10vh', justifyContent: 'center' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 300 }}>
    <Dropdown
        style={{margin: '0.2rem'}}
        placeholder='Select a Party'
        fluid
        selection
        options={users.map((user)=> {
return (
    {
        key: user.address,
        text: user.name,
        value: user.address,
        image: { avatar: true, src: jenny },
      }
)

        })}
        onChange={(event, data)=> setDestUser(data.value)}
    />

    <Header icon>
      <Icon name={`file ${fileTypes[file.type]} outline`} />
    {file.type ? file.name : 'Select a file to share' }.
    </Header>

    <Button type="file" primary style={{margin: '4rem'}}  onClick={() => fileInputRef.current.click()}>
        Select Document<input ref={fileInputRef} type="file" hidden onChange={(event)=> {selectFile(event.target.files[0])}}></input>
    </Button>
    <Button loading={submitting} positive style={{margin: '4rem'}} onClick={uploadFile}>Share file</Button>
    </Grid.Column>
    </Grid>
)

}
