import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody, CButton } from '@coreui/react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'
import { CImage } from '@coreui/react'
import { CAvatar } from '@coreui/react'
import Loader from '../components/Loader'
import {AiTwotoneDelete, AiTwotoneEdit} from "react-icons/ai";
import "../styles/Styles.css"
import moment from 'moment';



const UserList = () => {
    const { users, deleteUser } = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this user?');
        if (confirmDelete) {
          await deleteUser(id);
        }
      }

    const handleUpdate = async (id) => {
        navigate(`/dashboard/user/update/${id}`)
    }

    useEffect(() => {
        if (users) {
            setTimeout(function () {
                setIsLoading(false)
            }, 1500);
        }
    }, [users])

    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    {isLoading === true && <Loader />}
                    {isLoading === false && users && <>
                        <div className="mb-3">
                            <h2 className='mb-5 mt-2'>User List</h2>
                        </div>
                        <CTable>
                            <CTableHead color="dark">
                                <CTableRow>
                                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Emp. ID.</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Department</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">DOB</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">DOJ</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {users.map((u, i) => (
                                    <CTableRow key={u._id}>
                                        <CTableHeaderCell scope="row">
                                            {
                                                u.photo ?
                                                    (<CImage align="start" rounded src={u.photo} width={30} height={30} />)
                                                    :
                                                    (<CAvatar color="success" textColor="white" shape="rounded">{u.firstname.charAt(0)}{u.lastname.charAt(0)}</CAvatar>)
                                            }</CTableHeaderCell>
                                        <CTableDataCell>{u.employeeNumber}</CTableDataCell>
                                        <CTableDataCell>{u.firstname} {u.lastname}</CTableDataCell>
                                        <CTableDataCell>{u.email}</CTableDataCell>
                                        <CTableDataCell>{u.phone}</CTableDataCell>
                                        <CTableDataCell>{u.department ? u.department.name : ""}</CTableDataCell>
                                        <CTableDataCell>{moment(u.dateOfBirth).format('DD/MM/YYYY')}</CTableDataCell>
                                        <CTableDataCell>{moment(u.dateOfJoining).format('DD/MM/YYYY')}</CTableDataCell>
                                        <CTableDataCell>
                                            <AiTwotoneEdit color="success" variant="outline" onClick={() => { handleUpdate(u._id) }} className='edit'/>
                                            <AiTwotoneDelete color="danger" variant="outline" onClick={() => { handleDelete(u._id); }} className='delete'/>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </>}
                </div>
            </div>
        </div>
    )
}

export default UserList
