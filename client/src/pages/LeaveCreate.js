import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CForm, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react';
import { useLeave } from '../context/LeaveContext';
import { useUser } from '../context/UserContext';


const LeaveCreate = () => {

    const [userId, setUserId] = useState("")
    const [reason,setReason]=useState("")
    const [status,setStatus]=useState("")
    const [leaveStart,setLeaveStart]=useState("")
    const [leaveEnd,setLeaveEnd]=useState("")
    const [type,setType]=useState("")
    const [userList,setUserList]=useState([])

    const { addLeave } = useLeave()
    const {user}=useUser()
    const statusList = ["Approved", "Rejected", "Pending"]
    const typeList=["LWP","Paid"]

    const handleSubmit = () => {
        try {
            console.log(userId,reason,status,leaveStart,leaveEnd,type)
            // addLeave()
        } catch (error) {

        }
    }

    useEffect(() => {
        setUserList(user)
    }, [user])
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Create Leave</h2>
                    </div>
                    <CForm className="row g-3" onClick={handleSubmit}>
                        <CCol md={6}>
                            <CFormSelect id="inputUserName" label="User Name" value={userId} onChange={(e) => setUserId(e.target.value)}> 
                            {userList.map((u) => (
                                    <option key={u}>{u}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormInput id="inputReason" label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect id="inputStatus" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                {statusList.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput type="date" id="inputLeaveStart" label="Leave Start" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)}/>
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput type="date" id="inputLeaveEnd" label="Leave End" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)}/>
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect id="inputType" label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                            {typeList.map((t) => (
                                    <option key={t}>{t}</option>
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

export default LeaveCreate
