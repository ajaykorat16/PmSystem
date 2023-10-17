import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useCredential } from "../context/CredentialContext";
import { useAuth } from '../context/AuthContext';
import { ScrollPanel } from 'primereact/scrollpanel';
import Layout from "./Layout";
import '../styles/Styles.css'
import { Avatar } from "primereact/avatar";

function CredentialView({ title }) {
    const { id } = useParams()
    const { getSingleCredential } = useCredential()
    const { auth } = useAuth();
    const [credentialDetail, setCredentialDetail] = useState({
        title: "",
        description: "",
        users: "",
        photo: "",
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCredential = async () => {
            const data = await getSingleCredential(id);
            console.log(data);
            if (data) {
                const userNames = data.users.map(user => user.id.fullName);
                const userPhotos = data.users.map(user => user.id.photo)
                console.log(userPhotos);
                setCredentialDetail({
                    title: data.title,
                    description: data.description,
                    users: userNames.join(", "),
                    photo: userPhotos
                });
            }
        };
        fetchCredential();
    }, [getSingleCredential, id]);

    console.log(credentialDetail.photo);

    return (
        <Layout title={title}>
            <div className="m-2 credential">
                <div className="row">
                    <div className="col-11 credentialBody">
                        <p className="credentialTitle">{credentialDetail.title}</p>
                        <div className="credentialDescription" dangerouslySetInnerHTML={{ __html: credentialDetail.description }}></div>
                        <button
                            className="btn btn-primary mt-2"
                            onClick={() => { auth.user.role === "admin" ? navigate('/dashboard/credential/list') : navigate('/dashboard-user/credential/list') }}
                        >
                            Back
                        </button>
                        {/* <p className="users">{credentialDetail.users}</p> */}
                    </div>
                    <div className="col-1">
                        {credentialDetail.photo ? (
                            <Avatar image={`${credentialDetail.photo}`} size="xlarge" shape="circle" />
                        ) : (
                            <Avatar icon="pi pi-user" className="avatar" size="large" shape="circle" />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CredentialView;
