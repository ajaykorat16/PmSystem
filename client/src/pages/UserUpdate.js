import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CForm, CCol, CFormInput, CFormSelect, CButton, CRow } from '@coreui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext';
import { useDepartment } from '../context/DepartmentContext';
import { useEffect } from 'react';
import { CImage } from '@coreui/react'
import Loader from '../components/Loader'


const UserUpdate = () => {
    const [employeeNumber, setEmployeeNumber] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [departments, setDepartments] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [newPhoto, setNewPhoto] = useState(null);
    const [dateOfJoining, setDateOfJoining] = useState("");
    const [photo, setPhoto] = useState("");
    const [isLoading, setIsLoading] = useState(true)
    const { updateUser, getUserProfile } = useUser()
    const { department } = useDepartment()
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let { getProfile } = await getUserProfile(params.id);
                if (getProfile) {
                    setEmployeeNumber(getProfile.employeeNumber)
                    setFirstname(getProfile.firstname);
                    setLastname(getProfile.lastname);
                    setEmail(getProfile.email);
                    setAddress(getProfile.address)
                    setPhone(getProfile.phone)
                    setDepartments(getProfile.department ? getProfile.department._id : "")
                    setDateOfBirth(getProfile.dateOfBirth)
                    setDateOfJoining(getProfile.dateOfJoining)
                    setPhoto(getProfile.photo)
                    setIsLoading(false)
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchData();
    }, [params.id, getUserProfile]);


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let updateUsers = {employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department: departments, dateOfJoining, photo: newPhoto || photo }
            let id = params.id
            await updateUser(updateUsers, id)
            navigate('/dashboard/user/list')
        } catch (error) {
            console.log(error)
        }
    }

    const handlePhoto = async (e) => {
        setNewPhoto(e.target.files[0]);
    };

    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    {isLoading === true && <Loader />}
                    {isLoading === false && <>
                        <div className="mb-3">
                            <h2 className='mb-5 mt-2'>Update User</h2>
                        </div>
                        <CForm className="row g-3" onSubmit={handleSubmit}>
                            {photo && !newPhoto && (
                                <CCol xs={12}>
                                    <CImage
                                        align="left"
                                        rounded
                                        src={photo}
                                        width={200}
                                        height={200}
                                    />
                                </CCol>
                            )}

                            {!photo && newPhoto && (
                                <CCol xs={12}>
                                    <CImage
                                        align="left"
                                        rounded
                                        src={URL.createObjectURL(newPhoto)}
                                        width={200}
                                        height={200}
                                    />
                                </CCol>
                            )}

                            {photo && newPhoto && (
                                <CCol xs={12}>
                                    <CImage
                                        align="left"
                                        rounded
                                        src={URL.createObjectURL(newPhoto)}
                                        width={200}
                                        height={200}
                                    />
                                </CCol>
                            )}
                            <CRow>
                                <CCol md={4}>
                                    <CFormInput 
                                    id="inputEmployeeNo" 
                                    label="Employee Number" 
                                    value={employeeNumber} 
                                    onChange={(e) => setEmployeeNumber(e.target.value)} />
                                </CCol>
                            </CRow>
                            <CCol md={6}>
                                <CFormInput
                                    id="inputFirstName"
                                    label="First Name"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormInput
                                    id="inputLastName"
                                    label="Last Name"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormInput
                                    type="email"
                                    id="inputEmail4"
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormInput
                                    type="number"
                                    id="inputPhone"
                                    label="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </CCol>
                            <CCol xs={6}>
                                <CFormInput
                                    id="inputAddress"
                                    label="Address"
                                    placeholder="Enter your address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormSelect
                                    id="inputDepartment"
                                    label="Department"
                                    value={departments}
                                    onChange={(e) => setDepartments(e.target.value)}
                                >
                                    {department.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>
                            <CCol xs={6}>
                                <CFormInput
                                    type="date"
                                    id="inputJoining"
                                    label="Date Of Joining"
                                    value={dateOfJoining}
                                    onChange={(e) => setDateOfJoining(e.target.value)}
                                />
                            </CCol>
                            <CCol xs={6}>
                                <CFormInput
                                    type="date"
                                    id="inputBirth"
                                    label="Date Of Birth"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                />
                            </CCol>
                            <CCol xs={12}>
                                <CFormInput
                                    type="file"
                                    className="form-control"
                                    label={photo ? photo.name : "Upload Photo"}
                                    id="inputGroupFile04"
                                    accept="image/*"
                                    aria-describedby="inputGroupFileAddon04"
                                    aria-label="Upload"
                                    onChange={handlePhoto}
                                />
                            </CCol>
                            <CCol xs={12}>
                                <CButton type="submit" className="me-md-2">
                                    Submit
                                </CButton>
                            </CCol>
                        </CForm>
                    </>}
                </div>
            </div>
        </div>
    )
}

export default UserUpdate
