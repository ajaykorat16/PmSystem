import React, { useEffect, useState } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import toast, { Toaster } from "react-hot-toast"
import { useUser } from '../context/UserContext'
import Layout from './Layout'



const Login = ({ title }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { resetPassword } = useUser()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (password !== confirmPassword) {
                toast.error("Password and Confirm Password must be same");
            } else {
                const data = await resetPassword(password)
                if (data.error) {
                    toast.error(data.message)
                } else {
                    navigate("/")
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Layout title={title}>
            <CForm onSubmit={handleSubmit}>
                <h1 className="mb-4">Reset Password</h1>
                <CCol md={4}>
                    <CInputGroup className="mb-4">
                        <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                            type="password"
                            placeholder="New Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </CInputGroup>
                </CCol>
                <CCol md={4}>
                    <CInputGroup className="mb-4">
                        <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                            type="password"
                            placeholder="Confirm Password"
                            autoComplete="current-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </CInputGroup>
                </CCol>
                <CRow>
                    <CCol xs={6}>
                        <CButton color="primary" className="px-4" type='submit'>
                            Reset
                        </CButton>
                    </CCol>
                </CRow>
            </CForm>
        </Layout>
    )
}

export default Login
