import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CFormTextarea } from '@coreui/react'
import { useProject } from '../context/ProjectContext';

const WorkLogCreate = ({title}) => {
    const [projects, setProjects] = useState([]);
    const [selectproject, setSelectProject] = useState("");

    const { fetchProjects } = useProject()

    const getProjects = async () => {
        const { getAllProjects }  = await fetchProjects();
        setProjects(getAllProjects);
    };

    useEffect(() => {
        getProjects();
    }, []);

    return (
        <Layout title={title}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Create Project</h2>
            </div>
            <CForm className="row g-3"  >
                <CCol xs={6}>  
                    <CFormSelect id="inputProject" label="Project" value={selectproject} onChange={(e) => setSelectProject(e.target.value)}>
                        <option value="" disabled>Select a project</option>
                        {projects.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormInput id="inputTime" label="Time" type="number"/>
                </CCol>
                <CCol md={6}>
                    <CFormInput id="inputDate" label="Log Date" type="date" />
                </CCol>
                <CCol md={6}>
                    <CFormTextarea id="inputDescription" label="Description" />
                </CCol>
                <CCol xs={12}>
                  <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    )
}

export default WorkLogCreate