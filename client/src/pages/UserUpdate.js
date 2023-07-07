import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CForm, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext';
import { useDepartment } from '../context/DepartmentContext';
import { useEffect } from 'react';
import { CImage } from '@coreui/react'


const UserUpdate = () => {
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [departments, setDepartments] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [dateOfJoining, setDateOfJoining] = useState("");
    const [photo, setPhoto] = useState("");
    const { updateUser, getUserProfile } = useUser()
    const { department } = useDepartment()
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let { getProfile } = await getUserProfile(params.id);
                setFirstname(getProfile.firstname);
                setLastname(getProfile.lastname);
                setEmail(getProfile.email);
                setAddress(getProfile.address)
                setPhone(getProfile.phone)
                setDepartments(getProfile.department ? getProfile.department._id : "")
                setDateOfBirth(getProfile.dateOfBirth)
                setDateOfJoining(getProfile.dateOfJoining)
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchData();
    }, [params.id]);


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let updateUsers = { firstname, lastname, email, phone, address, dateOfBirth, department: departments, dateOfJoining }
            let id = params.id
            await updateUser(updateUsers, id)
            navigate('/user/list')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Update User</h2>
                    </div>
                    <CForm className="row g-3" onSubmit={handleSubmit}>
                        <div className="clearfix">
                            <CImage align="center" rounded src="/images/react400.jpg" width={200} height={200} />
                        </div>
                        <CCol md={6}>
                            <CFormInput id="inputFirstName" label="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput id="inputLastName" label="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput type="email" id="inputEmail4" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </CCol>
                        {/* <CCol md={6}>
                            <CFormInput type="password" id="inputPassword4" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </CCol> */}
                        <CCol md={6}>
                            <CFormInput type="number" id="inputPhone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput id="inputAddress" label="Address" placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect id="inputDepartment" label="Department" value={departments} onChange={(e) => setDepartments(e.target.value)}>
                                {department.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput type="date" id="inputJoining" label="Date Of Joining" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} />
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput type="date" id="inputBirth" label="Date Of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                        </CCol>
                        <CCol xs={12}>
                            <CButton type="submit" className="me-md-2">Submit</CButton>
                        </CCol>
                    </CForm>
                </div>
            </div>
        </div>
    )
}

export default UserUpdate
