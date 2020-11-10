import React, {useEffect, useState} from 'react'
import {Button, Icon, Loader, Table} from 'semantic-ui-react'

const index = require('../lib/index.js')

export default function Documents() {

    const user = localStorage.getItem('USER')
    const loggedUser = JSON.parse(user)

    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [dbClient,setDBClient] = useState(null)
    const [identity, setIdentity] = useState(null)

    useEffect(() => {
        index.init().then((result) => {
            setDBClient(result.client)
            setIdentity(result.identity)
            index.getAllFile(result.client,loggedUser.email).then(
                (files) => {
                    console.log("Filees:",files)
                    setDocs(files)
                    setLoading(false)
                }
            )
        })

    }, [])

    const downloadFile = (docIndex)=>{
        console.log('Downloading:',docIndex)
        index.downloadFile(docIndex, dbClient, loggedUser.email).then((result)=>{
            if(result)
                console.log("File downloaded!")
            else
                console.log("Some error occurred!")
        })
    }

    return (
        <Table celled striped style={{maxWidth: '50%'}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell colSpan='3'>Your documents</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {
                    !loading ?
                        docs.map((index) => {
                            return (
                                <Table.Row>
                                    <Table.Cell collapsing>
                                        <Icon name='file outline'/> Document {index}
                                    </Table.Cell>
                                    <Table.Cell>10 hours ago</Table.Cell>
                                    <Table.Cell collapsing textAlign='right'>
                                        <Button icon='download' onClick={()=>downloadFile(index)}/>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        ) :
                        <Loader active size='medium'>Loading
                        </Loader>
                }
            </Table.Body>
        </Table>

    )
}
