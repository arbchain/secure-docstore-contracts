import React, {useEffect, useState} from 'react'
import {Button, Icon, Loader, Table} from 'semantic-ui-react'

const index = require('../lib/index.js')

export default function Documents() {

    const identity = localStorage.getItem('identity')
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        index.init().then(() => {
            index.initializeMailBox(identity).then((user)=>{
                index.getAllFiles(user,identity).then((files) => {
                    setDocs(files)
                    setLoading(false)
                })
            })
        })

    }, [])

    const downloadFile = (document)=>{
        console.log('Downloading:',document)
        index.downloadFile(document,identity).then((result)=>{
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
                        docs.map((value) => {
                            return (
                                <Table.Row>
                                    <Table.Cell collapsing>
                                        <Icon name='file outline'/> Document
                                    </Table.Cell>
                                    <Table.Cell>10 hours ago</Table.Cell>
                                    <Table.Cell collapsing textAlign='right'>
                                        <Button icon='download' onClick={()=>downloadFile(value)}/>
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
