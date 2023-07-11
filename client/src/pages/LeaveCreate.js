import React, { useState } from 'react'
import { CForm, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react';
import { useLeave } from '../context/LeaveContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';


const LeaveCreate = () => {

    const [userId, setUserId] = useState("")
    const [reason, setReason] = useState("")
    const [status, setStatus] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [type, setType] = useState("")

    const { addLeave } = useLeave()
    const { users } = useUser()
    const statusList = ["Pending", "Approved", "Rejected"]
    const typeList = ["Paid", "LWP"]
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const leaveData = { reason, startDate, endDate, type, userId, status }
            await addLeave(leaveData)
            navigate('/dashboard/leave/list')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Layout>
            <div className="mb-3">
                <h2 className='mb-5 mt-2'>Create Leave</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormSelect id="inputUserName" label="User Name" onChange={(e) => setUserId(e.target.value)}>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>{`${u.firstname} ${u.lastname}`}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormInput id="inputReason" label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormSelect id="inputStatus" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {statusList.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol xs={6}>
                    <CFormInput type="date" id="inputstartDate" label="Leave Start" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </CCol>
                <CCol xs={6}>
                    <CFormInput type="date" id="inputendDate" label="Leave End" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormSelect id="inputType" label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                        {typeList.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit" className="me-md-2">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>

    )
}

export default LeaveCreate
