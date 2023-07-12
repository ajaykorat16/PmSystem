import React, { useEffect, useState } from 'react'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody } from '@coreui/react';
import { useLeave } from '../../context/LeaveContext';
import Loader from '../../components/Loader'
import moment from 'moment';
import { AiTwotoneDelete, AiTwotoneEdit } from 'react-icons/ai';
import Layout from '.././Layout';


const LeaveList = () => {
    const { userLeaves } = useLeave()
    const [leaveList, setLeaveList] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (userLeaves.length > 0) {
            setLeaveList(userLeaves)
            setIsLoading(false)
        }

    }, [userLeaves])

    return (
        <Layout>
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
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {leaveList.map((l, index) => (
                            <CTableRow key={l._id}>
                                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                <CTableDataCell>{`${l?.userId?.firstname} ${l?.userId?.lastname}`}</CTableDataCell>
                                <CTableDataCell>{l.reason}</CTableDataCell>
                                <CTableDataCell>{moment(l.startDate).format('DD/MM/YYYY')}</CTableDataCell>
                                <CTableDataCell>{moment(l.endDate).format('DD/MM/YYYY')}</CTableDataCell>
                                <CTableDataCell>{l.type}</CTableDataCell>
                                <CTableDataCell>{l.status}</CTableDataCell>
                            </CTableRow>
                        ))
                        }
                    </CTableBody>
                </CTable>
            </>}
        </Layout>

    )
}

export default LeaveList
