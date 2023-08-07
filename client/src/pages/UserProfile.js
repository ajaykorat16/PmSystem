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
import { Button } from 'primereact/button';
import { useLeaveManagement } from '../context/LeaveManagementContext';

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
    const { getUserLeave } = useLeaveManagement()
    const [leave, setLeave] = useState([])

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


    const fetchLeave = async () => {
        const { leaves } = await getUserLeave()
        setLeave(leaves)
    }
    useEffect(() => {
        fetchLeave()
    }, [])

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

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <Layout>
            {isLoading === true && <Loader />}
            {isLoading === false && <>
                <CForm onSubmit={handleSubmit}>
                    <div className='mainBody'>
                        <div className='row'>
                            <div className='col userBlock'>
                                <CCol className="mb-3">
                                    <div className="d-flex justify-content image-container">
                                        {photo && !newPhoto && (
                                            <Avatar
                                                image={`${photo}`}
                                                shape="circle"
                                                style={{ width: '300px', height: '300px', fontSize: '40px' }}
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
                                <div>
                                    <p className='title'>USER INFO</p>
                                </div>
                                <div className="userInfo mb-3">
                                    <div className='detail'>
                                        <div className='row userDetail'>
                                            <div className='col'><strong> Employee Id </strong></div>
                                            <div className='col'>{employeeNumber}</div>
                                        </div>
                                        <div className='row userDetail'>
                                            <div className='col'> <strong> Name </strong> </div>
                                            <div className='col'>{firstname} {lastname}</div>
                                        </div>
                                        <div className='row userDetail'>
                                            <div className='col'><strong> Department </strong> </div>
                                            <div className='col'>{departments}</div>
                                        </div>
                                        <div className='row userDetail'>
                                            <div className='col'><strong> Email </strong> </div>
                                            <div className='col'>{email}</div>
                                        </div>
                                        <div className='row userDetail'>
                                            <div className='col'> <strong> Date Of Joining </strong></div>
                                            <div className='col'>{dateOfJoining}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col leaveTale'>
                                <p className='title'>LEAVE RECORDS</p>
                                <CTable className='mailTable'>
                                    <CTableHead>
                                        <CTableRow color="dark">
                                            <CTableHeaderCell scope="col">Month</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Leave</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {months.map((month, index) => {
                                            const leaveDataForMonth = leave.find(item => {
                                                const date = new Date(item.monthly);
                                                return date.getMonth() === index;
                                            }) || {};

                                            return (
                                                <CTableRow key={index} className='tableBody'>
                                                    <CTableDataCell>{month}</CTableDataCell>
                                                    <CTableDataCell>{leaveDataForMonth.leave || '-'}</CTableDataCell>
                                                </CTableRow>
                                            );
                                        })}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </div>
                        <div id='editUser'>
                            <div className='row'>
                                <div className='col'>
                                    <p className='title'>EDIT USER INFO.</p>
                                </div>
                                <div className='col'>
                                    <div className="btn-sm float-end submitButton">
                                        <CCol>
                                            <Button icon="pi pi-check" type='submit' rounded aria-label="Filter" />
                                        </CCol>
                                    </div>
                                </div>
                            </div>
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
                        </div>
                    </div>
                </CForm>
            </>}
        </Layout >

    )
}

export default UserUpdate
