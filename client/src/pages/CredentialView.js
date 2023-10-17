import React, { useState } from "react";
import { useCredential } from "../context/CredentialContext";
import Layout from "./Layout";


function CredentialView({ title }) {
    const { getAllCredentials, deleteCredentials } = useCredential()

    return (
        <Layout title={title}>
            <div>CredentialView</div>
        </Layout>
    )
}

export default CredentialView