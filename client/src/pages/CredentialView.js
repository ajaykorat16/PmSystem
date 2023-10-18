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
        photo: [],
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCredential = async () => {
            const data = await getSingleCredential(id);
            if (data) {
                const userPhotos = data.users.map(user => user.id)
                setCredentialDetail({
                    title: data.title,
                    description: data.description,
                    photo: userPhotos
                });
            }
        };
        fetchCredential();
    }, [getSingleCredential, id]);

    return (
        <Layout title={title}>
            <div className="credential">
                <div className="row credentialLeftBody">
                    <div className="col-11 credentialBody">
                        <p className="credentialTitle">{credentialDetail.title}</p>
                        <div className="credentialDescription" dangerouslySetInnerHTML={{ __html: credentialDetail.description }}></div>
                        <button
                            className="btn btn-primary mt-2 mb-3"
                            onClick={() => { auth.user.role === "admin" ? navigate('/dashboard/credential/list') : navigate('/dashboard-user/credential/list') }}
                        >
                            Back
                        </button>
                    </div>
                    <div className="col-1 text-center credentialRightBody">
                        {credentialDetail.photo.length > 0 && (
                            credentialDetail.photo.map((user, index) => (
                                <div key={index}>
                                    <>
                                        <Avatar
                                            image={user.photo?.data && `data:${user.photo.contentType};base64, ${user.photo.data}`}
                                            icon={!user.photo?.data && 'pi pi-user'}
                                            size={!user.photo?.data && 'large'}
                                            className="credentialAvatar mt-3"
                                            shape="circle"
                                            style={{
                                                width: '70px',
                                                height: '70px',
                                                backgroundColor: (!user.photo?.data) ? '#2196F3' : null,
                                                color: (!user.photo?.data) ? '#ffffff' : null,
                                                cursor: "pointer",
                                            }}
                                        />
                                        <span className="userName">{user.fullName}</span>
                                    </>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CredentialView;
