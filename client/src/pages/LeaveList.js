import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody } from '@coreui/react';
import { useLeave } from '../context/LeaveContext';


const LeaveList = () => {
    const { leave } = useLeave()
    const [leaveList, setLeaveList] = useState([])

    useEffect(() => {
        setLeaveList(leave)
    }, [leave])


    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Leave List</h2>
                    </div>
                    <CTable>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Reason</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Start Date</CTableHeaderCell>
                                <CTableHeaderCell scope="col">End Date</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {leaveList && leaveList.map((l,index) => (
                                <CTableRow key={l._id}>
                                    <CTableHeaderCell scope="row">{index+1}</CTableHeaderCell>
                                    <CTableDataCell>{`${l?.userId?.firstname} ${l?.userId?.lastname}`}</CTableDataCell>
                                    <CTableDataCell>{l.reason}</CTableDataCell>
                                    <CTableDataCell>{l.startDate}</CTableDataCell>
                                    <CTableDataCell>{l.endDate}</CTableDataCell>
                                    <CTableDataCell>{l.type}</CTableDataCell>
                                    <CTableDataCell>{l.status}</CTableDataCell>
                                </CTableRow>
                            ))
                            }
                        </CTableBody>
                    </CTable>
                </div>
            </div>
        </div>
    )
}

export default LeaveList
