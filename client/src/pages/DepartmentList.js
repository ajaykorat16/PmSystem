import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody, CButton } from '@coreui/react';
import { useDepartment } from '../context/DepartmentContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader'
import { AiTwotoneDelete, AiTwotoneEdit } from 'react-icons/ai';


const DepartmentList = () => {
    const { department, deleteDepartment } = useDepartment()
    const [departmentList, setDepartmentList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    const handleDelete = async (id) => {
        await deleteDepartment(id)
    }

    const handleUpdate = async (id) => {
        navigate(`/dashboard/department/update/${id}`)
    }

    useEffect(() => {
        if (department) {
            setDepartmentList(department)
            setTimeout(function () {
                setIsLoading(false)
            }, 1000);
        }
    }, [department])


    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    {isLoading === true && <Loader />}
                    {isLoading === false && departmentList && <>
                        <div className="mb-3">
                            <h2 className='mb-5 mt-2'>Department List</h2>
                        </div>
                        <CTable>
                            <CTableHead color="dark">
                                <CTableRow>
                                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {departmentList && departmentList.map((list, index) => (
                                    <CTableRow key={list._id}>
                                        <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                        <CTableDataCell>{list.name}</CTableDataCell>
                                         <CTableDataCell>
                                            <AiTwotoneEdit color="success" variant="outline" onClick={() => { handleUpdate(list._id) }} className='edit'/>
                                            <AiTwotoneDelete color="danger" variant="outline" onClick={() => { handleDelete(list._id); }} className='delete'/>
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

export default DepartmentList