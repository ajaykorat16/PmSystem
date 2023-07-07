import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody, CButton } from '@coreui/react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'
import { CAvatar } from '@coreui/react'
import { CImage } from '@coreui/react'


const UserList = () => {
    const { users, deleteUser } = useUser()
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        await deleteUser(id)
    }

    const handleUpdate = async (id) => {
        navigate(`/user/update/${id}`)
    }
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
                                <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {users.map((u, i) => (
                                <CTableRow key={u._id}>
                                    <CTableHeaderCell scope="row"><CImage align="start" rounded src={u.photo} width={30} height={30} /></CTableHeaderCell>
                                    <CTableDataCell>{u.firstname} {u.lastname}</CTableDataCell>
                                    <CTableDataCell>{u.email}</CTableDataCell>
                                    <CTableDataCell>{u.phone}</CTableDataCell>
                                    <CTableDataCell>{u.address}</CTableDataCell>
                                    <CTableDataCell>{u.department ? u.department.name : ""}</CTableDataCell>
                                    <CTableDataCell>{u.dateOfBirth}</CTableDataCell>
                                    <CTableDataCell>{u.dateOfJoining}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="success" variant="outline" onClick={() => { handleUpdate(u._id) }}>Edit</CButton>
                                        <CButton color="danger" variant="outline" onClick={() => { handleDelete(u._id); }}>Delete</CButton>
                                    </CTableDataCell>
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
