import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import "react-quill/dist/quill.snow.css";
import { CButton, CCol, CForm, CFormInput, CFormSelect } from '@coreui/react'
import { useProject } from '../context/ProjectContext';
import { useWorklog } from '../context/WorklogContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'primereact/calendar';
import { Editor } from 'primereact/editor';
import { useHelper } from '../context/Helper';


const WorkLogCreate = ({ title }) => {
    const [projects, setProjects] = useState([]);
    const [selectproject, setSelectProject] = useState("");
    const [description, setDescription] = useState("")
    const [logDate, setLogDate] = useState(new Date())
    const [time, setTime] = useState("")
    const { createWorkLog } = useWorklog()
    const { getUserProject } = useProject()
    const { formatDate } = useHelper()
    const navigate = useNavigate()

    const getProjects = async () => {
        const { project } = await getUserProject();
        setProjects(project);
    };
    useEffect(() => {
        getProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const addWorkLog = { project: selectproject, description, logDate: formatDate(logDate), time }
            const data = await createWorkLog(addWorkLog)
            if (typeof data !== 'undefined' && data.error === false) {
                navigate('/dashboard-user/workLog/list')
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Layout title={title}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Create Work Log</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol xs={4}>
                    <CFormSelect id="inputProject" label="Project" value={selectproject} onChange={(e) => setSelectProject(e.target.value)} >
                        <option value="" disabled>Select a project</option>
                        {projects.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormInput id="inputTime" label="Time" type="number" value={time} min={0} onChange={(e) => setTime(e.target.value)} />
                </CCol>
                <CCol md={4}>
                    <label className="form-label">Log Date</label>
                    <Calendar
                        value={logDate}
                        dateFormat="dd-mm-yy"
                        onChange={(e) => setLogDate(e.target.value)}
                        maxDate={new Date()}
                        showIcon
                        id="date"
                        className="form-control"
                    />
                </CCol>
                <CCol md={12}>
                    <label className='mb-2'>Description</label>
                    <div className="card">
                        <Editor
                            value={description}
                            onTextChange={(e) => setDescription(e.htmlValue)}
                            className="editorContainer"
                        />
                    </div>
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    )
}

export default WorkLogCreate