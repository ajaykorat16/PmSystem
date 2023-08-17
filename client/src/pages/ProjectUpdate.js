import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import Layout from "./Layout";
import { MultiSelect } from "primereact/multiselect";
import { useUser } from "../context/UserContext";
import { useProject } from "../context/ProjectContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProjectUpdate = ({ title }) => {
    const { fetchUsers } = useUser();
    const { getSingleProject, updateProject } = useProject();
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [startDate, setStartDate] = useState("")
    const [developers, setDevelopers] = useState([]);
    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let { project } = await getSingleProject(params.id);
                setName(project.name)
                setStartDate(project.startDate);
                setDescription(project.description);
                if (project.developers && project.developers.length > 0) {
                    setDevelopers(project.developers.map((e) => e.id._id));
                } else {
                    setDevelopers([]);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchData();
    }, [params.id, getSingleProject]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let project = { name, description, startDate, developers: developers}
            let id = params.id
            
            const data = await updateProject(project, id)
            if (data.error) {
                toast.error(data.message)
            } else {
                navigate('/dashboard/project/list')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getUsers = async () => {
        const { getAllUsers } = await fetchUsers();
        setUsers(getAllUsers);
    };
    useEffect(() => {
        getUsers();
    }, []);

    return (
        <Layout title={title}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Update Project</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormInput id="inputName" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput id="inputDate" label="Date" type="date" max={new Date().toISOString().split('T')[0]} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </CCol>
                <CCol xs={12}>
                    <label htmlFor="developerSelect" className="form-label">Developers</label>
                    <MultiSelect
                        value={developers}
                        onChange={(e) => setDevelopers(e.target.value)}
                        options={users}
                        size={6}
                        style={{ border: "1px solid var(--cui-input-border-color, #b1b7c1)", borderRadius: "6px" }}
                        optionLabel="fullName"
                        placeholder="Select Users"
                        optionValue='_id'
                        id="developerSelect"
                        className="form-control"
                    />
                </CCol>
                <CCol md={12}>
                    <label className='mb-2'>Description</label>
                    <div className="editorContainer">     
                        <ReactQuill
                          className="editor"
                          theme="snow"
                          value={description}
                          onChange={setDescription}
                          modules={{
                            toolbar: [
                              [{ 'header': '1' }, { 'header': '2' }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'align': [] }],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['link', 'image'],
                              [{ 'font': [] }],
                              ['clean']
                            ],
                          }}
                          formats={[
                            'header', 'font', 'bold', 'italic', 'underline', 'strike', 'align',
                            'list', 'bullet', 'link', 'image'
                          ]}
                        />
                    </div> 
                </CCol>
                <CCol xs={12}>
                    <CButton className="me-md-2" onClick={() => navigate('/dashboard/project/list')}>
                        Back
                    </CButton>
                    <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    );
};

export default ProjectUpdate;
