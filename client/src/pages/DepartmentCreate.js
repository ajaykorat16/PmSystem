import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CRow, CCol, CFormInput, CButton } from '@coreui/react';



const DepartmentCreate = () => {
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Create Department</h2>
                    </div>
                    <CRow className="g-3">
                        <CCol sm={4} >
                            <CFormInput placeholder="Department" aria-label="Department" />
                        </CCol>
                        <CCol xs="auto">
                            <CButton type="submit">Submit</CButton>
                        </CCol>
                    </CRow>
                </div>
            </div>
        </div>
    )
}

export default DepartmentCreate
