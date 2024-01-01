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
        createdBy: "",
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCredential = async () => {
            try {
                const data = await getSingleCredential(id);

                if (data) {
                    setCredentialDetail({
                        title: data.credential.title,
                        description: data.credential.description,
                        photo: data.credential.users,
                        createdBy: data?.createdBy,
                    });
                }
            } catch (error) {
                console.error("Error fetching credential:", error);
            }
        };

        fetchCredential();
    }, [getSingleCredential, id, setCredentialDetail]);

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
                        <div className="createdBy">
                            <Avatar
                                image={credentialDetail.createdBy.photo && credentialDetail.createdBy.photo}
                                icon={!credentialDetail.createdBy?.photo && 'pi pi-user'}
                                size={!credentialDetail.createdBy?.photo && 'large'}
                                className="credentialAvatar"
                                shape="circle"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    backgroundColor: (!credentialDetail.createdBy?.photo) ? '#2196F3' : null,
                                    color: (!credentialDetail.createdBy?.photo) ? '#ffffff' : null,
                                    cursor: "pointer",
                                }} />
                            <span className="userName">{credentialDetail.createdBy?.fullName}</span>
                        </div>

                        {credentialDetail.photo.length > 0 && (
                            credentialDetail.photo.map((user, index) => (
                                <div key={index}>
                                    <>
                                        <Avatar
                                            image={user.photo && user?.photo}
                                            icon={!user?.photo && 'pi pi-user'}
                                            size={!user?.photo && 'large'}
                                            className="credentialAvatar mt-3"
                                            shape="circle"
                                            style={{
                                                width: '70px',
                                                height: '70px',
                                                backgroundColor: (!user.photo) ? '#2196F3' : null,
                                                color: (!user.photo) ? '#ffffff' : null,
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
