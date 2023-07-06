import React, { useEffect, useState } from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody } from '@coreui/react';
import { useDepartment } from '../context/DepartmentContext';


const DepartmentList = () => {
    const  {department}  = useDepartment()
    const [departmentList, setDepartmentList] = useState([])

    useEffect(() => {
        setDepartmentList(department)
        console.log(department)
    }, [department])
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Department List</h2>
                    </div>
                    <CTable>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {departmentList && departmentList.map((list, index)=>(
                            <CTableRow key={list._id}>
                                <CTableHeaderCell scope="row">{index+1}</CTableHeaderCell>
                                <CTableDataCell>{list.name}</CTableDataCell>
                            </CTableRow>
                            ))}
                            
                        </CTableBody>
                    </CTable>
                </div>
            </div>
        </div>
    )
}

export default DepartmentList