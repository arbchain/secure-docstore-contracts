import React, {useEffect, useState} from 'react'
import {Button, Form, Grid, Header, Image, Message, Segment} from 'semantic-ui-react'
import {Link, useHistory} from "react-router-dom";
import logo from "../static/logo.png";

const index = require('../lib/index.js')

function LoginForm() {

    let history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dbClient,setDBClient] = useState(null)
    const [identity, setIdentity] = useState(null)

    useEffect(() => {
        index.init().then((result)=>{
            setDBClient(result.client)
            setIdentity(result.identity)
            console.log("UseEffect Login all set!!")
        })

    }, [])


    async function loginUser() {
        let loginID = await index.loginUser(email,password,identity,dbClient)
        if (loginID!==null) {
            console.log("LoginID:",loginID)
            const json = {
                email: email,
                _id: loginID
            }
            localStorage.setItem("USER",JSON.stringify(json))
            history.push('/dashboard')
        }
    }

    return (
        <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
            <Grid.Column style={{maxWidth: 450}}>
                <Header as='h2' color='violet' textAlign='center'>
                    <Image src={logo}/> Log-in to your account
                </Header>
                <Form size='large'>
                    <Segment stacked>
                        <Form.Input fluid icon='mail' iconPosition='left' placeholder='E-mail address'
                                    onChange={(e, {value}) => setEmail(value)}/>
                        <Form.Input
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            onChange={(e, {value}) => setPassword(value)}
                        />

                        <Button color='violet' fluid size='large' onClick={loginUser}>
                            Login
                        </Button>
                    </Segment>
                </Form>
                <Message>
                    Haven't registered ? <Link to="/signup"> Sign Up</Link>
                </Message>
            </Grid.Column>
        </Grid>)
}


export default LoginForm