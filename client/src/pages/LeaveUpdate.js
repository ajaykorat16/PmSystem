import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CForm, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react';
import { useLeave } from '../context/LeaveContext';
import { useUser } from '../context/UserContext';
import { useNavigate, useParams } from 'react-router-dom';


const LeaveUpdate = () => {

    const [userId, setUserId] = useState("")
    const [reason, setReason] = useState("")
    const [status, setStatus] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [type, setType] = useState("")

    const { updateLeave, getLeaveById } = useLeave()
    const { users } = useUser()
    const statusList = ["Pending", "Approved", "Rejected"]
    const typeList = ["Paid", "LWP"]
    const navigate = useNavigate()
    const { id } = useParams()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const leaveData = { reason, startDate, endDate, type, userId, status }
            await updateLeave(leaveData, id)
            navigate('/leave/list')

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const setValues = async () => {
            const data = await getLeaveById(id)
            setUserId(data.userId? data.userId._id:"")
            setReason(data.reason)
            setStatus(data.status)
            setStartDate(data.startDate)
            setEndDate(data.endDate)
            setType(data.type)
        }
        setValues()

    }, [])


    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Update Leave</h2>
                    </div>
                    <CForm className="row g-3" onSubmit={handleSubmit}>
                        <CCol md={6}>
                            <CFormSelect id="inputUserName" label="User Name" value={userId} onChange={(e) => setUserId(e.target.value)}>
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
                </div>
            </div>
        </div>
    )
}

export default LeaveUpdate
