import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { CButton, CCol, CForm, CFormInput } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { Editor } from 'primereact/editor';
import { useNavigate, useParams } from 'react-router-dom';
import { useCredential } from '../context/CredentialContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useHelper } from '../context/Helper';

const CredentialUpdate = ({ title }) => {
    const { id } = useParams()
    const { auth, toast } = useAuth();
    const { onShow } = useHelper();
    const { userForCredential } = useUser();
    const { getSingleCredential, updateCredential } = useCredential();
    const [users, setUsers] = useState([]);
    const [credentialTitle, setCredentialTitle] = useState("");
    const [description, setDescription] = useState("")
    const [developers, setDevelopers] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const currentCredential = async () => {
            const data = await getSingleCredential(id);
            if (data) {
                setCredentialTitle(data.credential.title);
                setDescription(data.credential.description);
                if (data.credential.users && data.credential.users.length > 0) {
                    setDevelopers(data.credential.users.map((e) => e.id._id));
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
            const credentialData = { title: credentialTitle, description, users: developers }
            const data = await updateCredential(credentialData, id)
            if (data.error) {
                toast.current.show({ severity: 'error', summary: 'Credential', detail: data.message, life: 3000 })
            }else{
                navigate('/dashboard/credential/list')
            }
        } catch (error) {
            console.log(error)
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
        <Layout title={title} toast={toast}>
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
                        onShow={onShow}
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

export default CredentialUpdate