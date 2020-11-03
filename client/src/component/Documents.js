import React, {useEffect, useState} from 'react'
import {Button, Icon, Loader, Table} from 'semantic-ui-react'

const index = require('../lib/index.js')

export default function Documents() {

    const password = localStorage.getItem('password')
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        index.init().then(() => {
            index.getAllFile().then(
                (files) => {
                    setDocs(files)
                    setLoading(false)
                }
            )
        })

    }, [])

    const downloadFile = (docHash)=>{
        console.log('Downloading:',docHash)
        index.downloadFile(docHash,password).then((result)=>{
            if(result)
                alert("File downloaded!")
            else
                alert("Some error occurred!")
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
                                        <Icon name='file outline'/> Document {value}
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
