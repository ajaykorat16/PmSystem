import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody } from '@coreui/react';
import { useEffect } from 'react';
import { useUser } from '../context/UserContext';


const UserList = () => {
    const { users } = useUser()
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>User List</h2>
                    </div>
                    <CTable>
                        <CTableHead color="dark">
                            <CTableRow>
                                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Address</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Department</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Date Of Birth</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Date Of Joining</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {users.map((u, i) => (
                                <CTableRow key={u._id}>
                                    <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                    <CTableDataCell>{u.firstname} {u.lastname}</CTableDataCell>
                                    <CTableDataCell>{u.email}</CTableDataCell>
                                    <CTableDataCell>{u.phone}</CTableDataCell>
                                    <CTableDataCell>{u.address}</CTableDataCell>
                                    <CTableDataCell>{u.department ? u.department.name : ""}</CTableDataCell>
                                    <CTableDataCell>{u.dateOfBirth}</CTableDataCell>
                                    <CTableDataCell>{u.dateOfJoining}</CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                </div>
            </div>
        </div>
    )
}

export default UserList
