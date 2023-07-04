import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody } from '@coreui/react';


const DepartmentList = () => {
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
                                <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            <CTableRow>
                                <CTableHeaderCell scope="row">1</CTableHeaderCell>
                                <CTableDataCell>Mark</CTableDataCell>
                                <CTableDataCell>Otto</CTableDataCell>
                                <CTableDataCell>@mdo</CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                                <CTableHeaderCell scope="row">2</CTableHeaderCell>
                                <CTableDataCell>Jacob</CTableDataCell>
                                <CTableDataCell>Thornton</CTableDataCell>
                                <CTableDataCell>@fat</CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                                <CTableHeaderCell scope="row">3</CTableHeaderCell>
                                <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
                                <CTableDataCell>@twitter</CTableDataCell>
                            </CTableRow>
                        </CTableBody>
                    </CTable>
                </div>
            </div>
        </div>
    )
}

export default DepartmentList
