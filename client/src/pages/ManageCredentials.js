import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { CButton, CCol, CForm, CFormInput } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { useCredential } from '../context/CredentialContext';
import { useUser } from '../context/UserContext';
import { Editor } from 'primereact/editor';

const ManageCredentials = ({ title }) => {
    const { userForCredential } = useUser();
    const { addCredentials } = useCredential();
    const [users, setUsers] = useState([]);
    const [credentialTitle, setCredentialTitle] = useState("");
    const [description, setDescription] = useState("")
    const [developers, setDevelopers] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const credentials = { title: credentialTitle, description, users: developers.map(dev => ({ id: dev._id })) }
            const data = await addCredentials(credentials)
            if (typeof data !== 'undefined' && data.error === false) {
                // navigate('/dashboard/project/list')
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const getUsers = async () => {
        const { getAllUsers } = await userForCredential();
        setUsers(getAllUsers);
    };
    useEffect(() => {
        getUsers();
    }, []);

    return (
        <Layout title={title}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Manage Credentials</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={12}>
                    <CFormInput id="inputTitle" label="Title" value={credentialTitle} onChange={(e) => setCredentialTitle(e.target.value)} />
                </CCol>
                <CCol xs={12}>
                    <label htmlFor="developerSelect" className="form-label">Users</label>
                    <MultiSelect
                        value={developers}
                        onChange={(e) => setDevelopers(e.value)}
                        options={users}
                        size={6}
                        style={{ border: "1px solid var(--cui-input-border-color, #b1b7c1)", borderRadius: "6px" }}
                        optionLabel="fullName"
                        placeholder="Select Users"
                        id="developerSelect"
                        className="form-control"
                    />
                </CCol>
                <CCol md={12}>
                    <label className='mb-2'>Description</label>
                    <div className="card">
                        <Editor value={description} onTextChange={(e) => setDescription(e.htmlValue)} className="editorContainer" />
                    </div>
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    )
}

export default ManageCredentials