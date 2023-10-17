import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useCredential } from "../context/CredentialContext";
import { useAuth } from '../context/AuthContext';
import { ScrollPanel } from 'primereact/scrollpanel';
import Layout from "./Layout";
import '../styles/Styles.css'

function CredentialView({ title }) {
    const { id } = useParams()
    const { getSingleCredential } = useCredential()
    const { auth } = useAuth();
    const [credentialDetail, setCredentialDetail] = useState({
        title: "",
        description: "",
        users: ""
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCredential = async () => {
            const data = await getSingleCredential(id);
            if (data) {
                const userNames = data.users.map(user => user.id.fullName);
                setCredentialDetail({
                    title: data.title,
                    description: data.description,
                    users: userNames.join(", ")
                });
            }
        };
        fetchCredential();
    }, [getSingleCredential, id]);

    return (
        <Layout title={title}>
            <div className="mainBody credential">
                <p className="credentialTitle">{credentialDetail.title}</p>
                <ScrollPanel
                    className="customCredential"
                >
                    <div className="credentialDescription" dangerouslySetInnerHTML={{ __html: credentialDetail.description }}></div>
                </ScrollPanel>
                <div className="credentialUsers">
                    <p className="users">{credentialDetail.users}</p>
                </div>
                <button
                    className="btn btn-primary mt-2"
                    onClick={() => { auth.user.role === "admin" ? navigate('/dashboard/credential/list') : navigate('/dashboard-user/credential/list') }}
                >
                    Back
                </button>
            </div>
        </Layout>
    )
}

export default CredentialView;
