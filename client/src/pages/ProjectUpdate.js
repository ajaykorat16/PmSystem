import React, { useEffect, useState } from "react";
import { CCol, CFormInput, CButton, CForm, CFormTextarea } from "@coreui/react";
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
  const [description, setDescriptions] = useState("")
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
        setDescriptions(project.description);
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
        <h2 className="mb-5 mt-2">Create Project</h2>
      </div>
      <CForm className="row g-3" onSubmit={handleSubmit}>
        <CCol md={6}>
          <CFormInput id="inputName" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </CCol>
        <CCol md={6}>
          <CFormInput id="inputDate" label="Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </CCol>
        <CCol md={6}>
          <CFormTextarea id="inputDescription" label="Description" value={description} onChange={(e) => setDescriptions(e.target.value)} />
        </CCol>
        <CCol xs={6}>
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
        <CCol xs={12}>
          <CButton type="submit">Submit</CButton>
        </CCol>
      </CForm>
    </Layout>
  );
};

export default ProjectUpdate;
