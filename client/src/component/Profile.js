import React, {useEffect, useState} from 'react'
import { Header, Image } from 'semantic-ui-react'

const index = require('../lib/index.js')

export default function Profile() {

  const [user, setUser] = useState({})

  useEffect(() => {
    index.init().then((fromUser)=> {
    index.getAllUsers(fromUser).then(result =>{
      console.log(result)
       if(result.caller) {
         console.log(result.caller)
           setUser(result.caller)
       }
   })       
    })       

}, [] )

     return (
  <Header as='h2'>
    <Image circular src='https://react.semantic-ui.com/images/avatar/large/patrick.png' /> {user.name}
  </Header>
)
}

