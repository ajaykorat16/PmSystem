import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody, CButton } from '@coreui/react';
import { useLeave } from '../context/LeaveContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader'


const LeaveList = () => {
    const { leave, deleteLeave } = useLeave()
    const [leaveList, setLeaveList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (leave) {
            setLeaveList(leave)
            setTimeout(function () {
                setIsLoading(false)
            }, 1000);
        }

    }, [leave])

    const handleDelete = async (id) => {
        await deleteLeave(id)
    }

    const handleUpdate = async (id) => {
        navigate(`/dashboard/leave/update/${id}`)
    }


    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    {isLoading === true && <Loader />}
                    {isLoading === false && leaveList && <>
                        <div className="mb-3">
                            <h2 className='mb-5 mt-2'>Leave List</h2>
                        </div>
                        <CTable>
                            <CTableHead color="dark"> 
                                <CTableRow>
                                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Reason</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Start Date</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">End Date</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {leaveList.map((l, index) => (
                                    <CTableRow key={l._id}>
                                        <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                        <CTableDataCell>{`${l?.userId?.firstname} ${l?.userId?.lastname}`}</CTableDataCell>
                                        <CTableDataCell>{l.reason}</CTableDataCell>
                                        <CTableDataCell>{l.startDate}</CTableDataCell>
                                        <CTableDataCell>{l.endDate}</CTableDataCell>
                                        <CTableDataCell>{l.type}</CTableDataCell>
                                        <CTableDataCell>{l.status}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="success" variant="outline" onClick={() => { handleUpdate(l._id) }} className='m-1'>Edit</CButton>
                                            <CButton color="danger" variant="outline" onClick={() => { handleDelete(l._id); }}>Delete</CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                                }
                            </CTableBody>
                        </CTable>
                    </>}
                </div>
            </div>
        </div>
    )
}

export default LeaveList
