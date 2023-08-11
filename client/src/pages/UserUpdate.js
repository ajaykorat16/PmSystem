import React from 'react'
import { CForm, CCol, CFormInput, CFormSelect, CButton, CRow, CFormTextarea } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext';
import { useDepartment } from '../context/DepartmentContext';
import { useEffect } from 'react';
import { CImage } from '@coreui/react'
import Loader from '../components/Loader'
import Layout from './Layout';
import toast from 'react-hot-toast';


const UserUpdate = ({ title }) => {
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
    const { getDepartmentList } = useDepartment()
    const [departmentsList, setDepartmentsList] = useState([]);
    const navigate = useNavigate();
    const params = useParams();
    const [selectedCities, setSelectedCities] = useState(null);
    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ]

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

    const fetchDepartment = async () => {
        const { departments } = await getDepartmentList()
        setDepartmentsList(departments)
    }

    useEffect(() => {
        fetchDepartment()
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let updateUsers = { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department: departments, dateOfJoining, photo: newPhoto || photo }
            let id = params.id
            const data = await updateUser(updateUsers, id)
            if (data.error) {
                toast.error(data.message)
            } else {
                navigate('/dashboard/user/list')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handlePhoto = async (e) => {
        setNewPhoto(e.target.files[0]);
    };

    return (
        <Layout title={title}>
            {isLoading === true && <Loader />}
            {isLoading === false && <>
                <div className="mb-3">
                    <h2 className='mb-5 mt-2'>Update User</h2>
                </div>
                <CForm className="row g-3" onSubmit={handleSubmit}>
                    {photo && !newPhoto && (
                        <CCol xs={12}>
                            <CImage
                                align="start"
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
                                onChange={(e) => setEmployeeNumber(e.target.value)}
                                disabled
                            />
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
                            disabled
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
                        <CFormTextarea
                            type="text"
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
                            {departmentsList.map((d) => (
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
                    <CCol xs={6}>
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
                    <CCol xs={6}>   
                        <label htmlFor="projectSelect" className="form-label">Project</label>  
                            <MultiSelect 
                                value={selectedCities} 
                                onChange={(e) => setSelectedCities(e.value)} 
                                options={cities}
                                size={6}
                                style={{border:"1px solid var(--cui-input-border-color, #b1b7c1)", borderRadius:"6px"}}
                                optionLabel="name" 
                                placeholder="Select Cities" 
                                id="projectSelect"
                                className="form-control"
                            />
                    </CCol>
                    <CCol xs={12}>
                        <CButton type="submit" className="me-md-2">
                            Submit
                        </CButton>
                    </CCol>
                </CForm>
            </>}
        </Layout>

    )
}

export default UserUpdate
