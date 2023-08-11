import React, { useEffect, useState } from "react";
import { CCol, CFormInput, CButton, CForm, CFormTextarea } from "@coreui/react";
import Layout from "./Layout";
import { MultiSelect } from "primereact/multiselect";
import { useUser } from "../context/UserContext";
import { useProject } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProjectCreate = ({ title }) => {
  const { fetchUsers } = useUser();
  const { createProject } = useProject();
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("")
  const [description, setDescriptions] = useState("")
  const [startDate, setStartDate] = useState("")
  const [developers, setDevelopers] = useState([]);
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const addProject = { name, description, startDate, developers: developers.map(dev => ({ id: dev._id })) }
      const data = await createProject(addProject)
      if (data.error) {
        toast.error(data.message)
      } else {
        navigate('/dashboard/project/list')
        console.log(developers);
      }
    } catch (error) {
        console.log(error.message)
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
        <h2 className="mb-5 mt-2">Create Project</h2>
      </div>
      <CForm className="row g-3"  onSubmit={handleSubmit}>
        <CCol md={6}>
          <CFormInput id="inputName" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </CCol>
        <CCol md={6}>
          <CFormInput id="inputDate" label="Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
        </CCol>
        <CCol md={6}>
          <CFormTextarea id="inputDescription" label="Description" value={description} onChange={(e) => setDescriptions(e.target.value)} />
        </CCol>
        <CCol xs={6}>   
        <label htmlFor="developerSelect" className="form-label">Developers</label>  
          <MultiSelect
            value={developers} 
            onChange={(e) => setDevelopers(e.value)} 
            options={users}
            size={6}
            style={{border:"1px solid var(--cui-input-border-color, #b1b7c1)", borderRadius:"6px"}}
            optionLabel="fullName" 
            placeholder="Select Users" 
            id="developerSelect"
            className="form-control"
          />
        </CCol>
        <CCol xs={12}>
          <CButton type="submit">Submit</CButton>
        </CCol>
      </CForm>
    </Layout>
  );
};

export default ProjectCreate;
