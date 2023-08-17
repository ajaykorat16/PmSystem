import React, { useEffect } from 'react'
import { CForm, CCol, CFormInput, CFormSelect, CButton, CFormTextarea } from '@coreui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext';
import { useDepartment } from '../context/DepartmentContext';
import Layout from './Layout';
import toast from "react-hot-toast"

const UserCreate = ({ title }) => {
    const [employeeNumber, setEmployeeNumber] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [departments, setDepartments] = useState("");
    const [departmentsList, setDepartmentsList] = useState([]);
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [dateOfJoining, setDateOfJoining] = useState("");
    const { createUser } = useUser()
    const { getDepartmentList } = useDepartment()
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (password !== confirmPassword) {
                toast.error("Password and Confirm Password must be same");
            } else {
                let addUser = { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department: departments, dateOfJoining }
                const data = await createUser(addUser)
                if (data.error) {
                    toast.error(data.message)
                } else {
                    navigate('/dashboard/user/list')
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const fetchDepartment = async () => {
        const { departments } = await getDepartmentList()
        setDepartmentsList(departments)
    }
    useEffect(() => {
        fetchDepartment()
    }, [])

    return (
        <Layout title={title}>
            <div className="mb-3">
                <h2 className='mb-5 mt-2'>Create User</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormInput id="inputEmployeeNo" label="Employee Number" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput type="email" id="inputEmail4" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput id="inputFirstName" label="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput id="inputLastName" label="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput type="password" id="inputPassword4" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput type="password" id="inputConfirmPassword" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput type="number" id="inputPhone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </CCol>
                <CCol xs={6}>
                    <CFormTextarea type="area" id="inputAddress" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </CCol>
                <CCol md={4}>
                    <CFormSelect id="inputDepartment" label="Department" value={departments} onChange={(e) => setDepartments(e.target.value)}>
                        <option value="" disabled>Select a department</option>
                        {departmentsList.map((d) => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol xs={4}>
                    <CFormInput type="date" id="inputJoining" label="Date Of Joining" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} />
                </CCol>
                <CCol xs={4}>
                    <CFormInput type="date" max={new Date().toISOString().split('T')[0]} id="inputBirth" label="Date Of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit" className="me-md-2">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    )
}

export default UserCreate
