import React from 'react'
import { CForm, CCol, CFormInput, CButton, CRow, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';
import { CImage } from '@coreui/react'
import Loader from '../components/Loader'
import Layout from './Layout';
import toast from 'react-hot-toast';
import { Avatar } from 'primereact/avatar';


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
    const { updateProfile, getUserProfile } = useUser()
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
                    setDepartments(getProfile.department ? getProfile.department.name : "")
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
            let updateUsers = { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, dateOfJoining, photo: newPhoto || photo }
            const data = await updateProfile(updateUsers)
            if (data.error) {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handlePhoto = async (e) => {
        setNewPhoto(e.target.files[0]);
    };

    return (
        <Layout>
            {isLoading === true && <Loader />}
            {isLoading === false && <>
                <CForm onSubmit={handleSubmit}>
                    <div className='mainBody'>
                        <div className='row'>
                            <div className='col'>
                                <CCol className="mb-3">
                                    <div className="d-flex justify-content">
                                        {photo && !newPhoto && (
                                            <Avatar
                                                image={`${photo}`}
                                                shape="circle"
                                                style={{ width: '370px', height: '400px', fontSize: '40px' }}
                                            />
                                        )}
                                        {!photo && newPhoto && (
                                            <CImage
                                                align="start"
                                                rounded
                                                src={URL.createObjectURL(newPhoto)}
                                                width={200}
                                                height={200}
                                            />
                                        )}
                                        {photo && newPhoto && (
                                            <CImage
                                                align="start"
                                                rounded
                                                src={URL.createObjectURL(newPhoto)}
                                                width={200}
                                                height={200}
                                            />
                                        )}
                                    </div>
                                </CCol>
                                <div className="userInfo mb-3">
                                    <p> <strong> Employee Id : </strong> {employeeNumber}</p>
                                    <p> <strong> Name : </strong> {firstname} {lastname}</p>
                                    <p> <strong> Department : </strong> {departments}</p>
                                    <p> <strong> Email : </strong> {email}</p>
                                    <p> <strong> Date Of Joining : </strong> {dateOfJoining}</p>
                                </div>
                            </div>
                            <div className='col'>
                                <CTable>
                                    <CTableHead>
                                        <CTableRow color="dark">
                                            <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Month</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Leave</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">1</CTableHeaderCell>
                                            <CTableDataCell>Mark</CTableDataCell>
                                            <CTableDataCell>Otto</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                            <CTableDataCell>Jacob</CTableDataCell>
                                            <CTableDataCell>Thornton</CTableDataCell>
                                        </CTableRow>
                                    </CTableBody>
                                </CTable>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col'>
                                <div className='row'>
                                    <div className='col'>
                                        <CCol>
                                            <CFormInput
                                                id="inputFirstName"
                                                label="First Name"
                                                value={firstname}
                                                className='mb-3'
                                                onChange={(e) => setFirstname(e.target.value)}
                                            />
                                        </CCol>
                                    </div>
                                    <div className='col'>
                                        <CCol>
                                            <CFormInput
                                                id="inputLastName"
                                                label="Last Name"
                                                className='mb-3'
                                                value={lastname}
                                                onChange={(e) => setLastname(e.target.value)}
                                            />
                                        </CCol>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col'>
                                        <CCol>
                                            <CFormInput
                                                id="inputAddress"
                                                label="Address"
                                                placeholder="Enter your address"
                                                className='mb-3'
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </CCol>
                                    </div>
                                    <div className='col'>
                                        <CCol>
                                            <CFormInput
                                                type="number"
                                                id="inputPhone"
                                                label="Phone Number"
                                                className='mb-3'
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </CCol>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col'>
                                        <CCol>
                                            <CFormInput
                                                type="date"
                                                id="inputBirth"
                                                label="Date Of Birth"
                                                className='mb-3'
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                            />
                                        </CCol>
                                    </div>
                                    <div className='col'>
                                        <CCol>
                                            <CFormInput
                                                type="file"
                                                className="form-control mb-3"
                                                label="Upload Photo"
                                                id="inputGroupFile04"
                                                accept="image/*"
                                                aria-describedby="inputGroupFileAddon04"
                                                aria-label="Upload"
                                                onChange={handlePhoto}
                                            />
                                        </CCol>
                                    </div>
                                </div>
                                <CCol xs={12}>
                                    <CButton type="submit" className="me-md-2">
                                        Submit
                                    </CButton>
                                </CCol>
                            </div>
                        </div>
                    </div>
                </CForm>
            </>}
        </Layout >

    )
}

export default UserUpdate
