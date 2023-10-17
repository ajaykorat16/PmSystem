import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useCredential } from "../context/CredentialContext";
import { useAuth } from '../context/AuthContext';
import { Avatar } from "primereact/avatar";
import Layout from "./Layout";
import '../styles/Styles.css'

function CredentialView({ title }) {
    const { id } = useParams()
    const { getSingleCredential } = useCredential()
    const { auth } = useAuth();
    const [credentialDetail, setCredentialDetail] = useState({
        title: "",
        description: "",
        users: "",
        photo: [],
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCredential = async () => {
            const data = await getSingleCredential(id);
            if (data) {
                const userNames = data.users.map(user => user.id.fullName);
                const userPhotos = data.users.map(user => user.id)
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
                    </div>
                    <div className="col-1">
                        {credentialDetail.photo.length > 0 ? (
                            credentialDetail.photo.map((user, index) => (
                                <div key={index}>
                                    {user.photo?.data ? (
                                        <Avatar image={`data:${user.photo.contentType};base64, ${user.photo.data}`} size="large" shape="circle" className="m-3" title={user.fullName} />
                                    ) : (
                                        <Avatar icon="pi pi-user" className="avatar m-3" size="large" shape="circle" title={user.fullName} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No photos available</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CredentialView;
