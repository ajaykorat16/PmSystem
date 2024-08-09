import React from 'react'
import { CForm, CCol, CFormInput, CFormSelect, CButton, CRow, CFormTextarea } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext';
import { useDepartment } from '../context/DepartmentContext';
import { useProject } from '../context/ProjectContext';
import { useEffect } from 'react';
import { CImage } from '@coreui/react'
import Loader from '../components/Loader'
import Layout from './Layout';
import { Calendar } from 'primereact/calendar';
import { useHelper } from '../context/Helper';
import { useAuth } from '../context/AuthContext';


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
    const [projects, setProjects] = useState([]);
    const [newProjects, setNewProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { updateUser, getUserProfile } = useUser()
    const { toast } = useAuth
    const { getDepartmentList } = useDepartment()
    const [departmentsList, setDepartmentsList] = useState([]);
    const { fetchProjects } = useProject()
    const { formatDate, onShow } = useHelper()
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let { data: getProfile } = await getUserProfile(params.id);
                if (getProfile) {
                    setEmployeeNumber(getProfile.employeeNumber)
                    setFirstname(getProfile.firstname);
                    setLastname(getProfile.lastname);
                    setEmail(getProfile.email);
                    setAddress(getProfile.address)
                    setPhone(getProfile.phone)
                    setDepartments(getProfile.department ? getProfile.department : "")
                    setDateOfBirth(new Date(getProfile.dateOfBirth))
                    setDateOfJoining(new Date(getProfile.dateOfJoining))
                    if (getProfile.photo !== null) {
                        const response = await fetch(getProfile.photo);
                        const blob = await response.blob();

                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64String = reader.result;
                            setPhoto(base64String);
                        };
                        reader.readAsDataURL(blob);
                    }
                    
                    if (getProfile.projects && getProfile.projects.length > 0) {
                        setNewProjects(getProfile.projects.map((e) => e.id));
                    } else {
                        setNewProjects([]);
                    }
                    setIsLoading(false)
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchData();
    }, [params.id, getUserProfile]);

    const fetchDepartment = async () => {
        const { data } = await getDepartmentList()
        setDepartmentsList(data);
    }

    useEffect(() => {
        fetchDepartment()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let updateUsers = { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth: formatDate(dateOfBirth), department: departments, dateOfJoining: formatDate(dateOfJoining), photo: newPhoto ? newPhoto : photo, projects: newProjects }
            let id = params.id
            const data = await updateUser(updateUsers, id)
console.log("data-----------", data);

            if (data.error) {
                toast.current.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 })
            } else {
                navigate('/dashboard/user/list')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handlePhoto = async (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setNewPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setCredential({ ...credential, image: reader.result });
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    const getProjects = async () => {
        const { data } = await fetchProjects();
        setProjects(data);
    };

    useEffect(() => {
        getProjects();
    }, []);

    return (
        <Layout title={title} toast={toast}>
            {isLoading === true && <Loader />}
            {isLoading === false && <>
                <div className="mb-3">
                    <h2 className='mb-5 mt-2'>Update User</h2>
                </div>
                <CForm className="row g-3 mb-3" onSubmit={handleSubmit}>
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
                                align="start"
                                rounded
                                src={newPhoto}
                                width={200}
                                height={200}
                            />
                        </CCol>
                    )}

                    {photo && newPhoto && (
                        <CCol xs={12}>
                            <CImage
                                align="start"
                                rounded
                                src={newPhoto}
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
                            placeholder="Select Department"
                            value={departments}
                            onChange={(e) => setDepartments(e.target.value)}
                        >
                            <option value="" disabled>Select a Department</option>
                            {departmentsList.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol xs={6}>
                        <label className="form-label">Date Of Joining</label>
                        <Calendar
                            value={dateOfJoining}
                            dateFormat="dd-mm-yy"
                            onChange={(e) => setDateOfJoining(e.target.value)}
                            showIcon
                            id="date"
                            className="form-control"
                        />
                    </CCol>
                    <CCol xs={6}>
                        <label className="form-label">Date Of Birth</label>
                        <Calendar
                            value={dateOfBirth}
                            dateFormat="dd-mm-yy"
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            maxDate={new Date()}
                            showIcon
                            id="date"
                            className="form-control"
                        />
                    </CCol>
                    <CCol xs={6}>
                        <CFormInput
                            type="file"
                            className="form-control"
                            label={"Upload Photo"}
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
                            value={newProjects}
                            onChange={(e) => setNewProjects(e.target.value)}
                            options={projects}
                            size={6}
                            optionLabel="name"
                            optionValue='id'
                            placeholder="Select Projects"
                            id="date"
                            className="form-control"
                            onShow={onShow}
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
