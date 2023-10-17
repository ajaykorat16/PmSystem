import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { CButton, CCol, CForm, CFormInput } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { Editor } from 'primereact/editor';
import { useNavigate, useParams } from 'react-router-dom';
import { useCredential } from '../context/CredentialContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const CredentialUpdate = ({ title }) => {
    const { id } = useParams()
    const { userForCredential } = useUser();
    const { getSingleCredential, updateCredential } = useCredential();
    const { auth } = useAuth();
    const navigate = useNavigate()
    const [users, setUsers] = useState([]);
    const [credentialTitle, setCredentialTitle] = useState("");
    const [description, setDescription] = useState("")
    const [developers, setDevelopers] = useState([])

    useEffect(() => {
        const currentCredential = async () => {
            const data = await getSingleCredential(id);
            if (data) {
                setCredentialTitle(data.title);
                setDescription(data.description);
                if (data.users && data.users.length > 0) {
                    setDevelopers(data.users.map((e) => e.id._id));
                } else {
                    setDevelopers([]);
                }
            }
        };
        currentCredential();
    }, [getSingleCredential, id]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const credentialData = { title: credentialTitle, description, users: developers}
            const data = await updateCredential(credentialData, id)
            if (typeof data !== 'undefined' && data.error === false) {
                const redirectPath = auth.user.role === "admin" ? `/dashboard/credential/list` : `/dashboard-user/credential/list`;
                navigate(redirectPath);
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
                <h2 className="mb-5 mt-2">Update Credentials</h2>
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
                        optionValue='_id'
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
                    <CButton
                        className="me-md-2"
                        onClick={() => { auth.user.role === "admin" ? navigate('/dashboard/credential/list') : navigate('/dashboard-user/credential/list') }}
                    >
                        Back
                    </CButton>
                    <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    )
}

export default CredentialUpdate