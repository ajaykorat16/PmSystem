import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CForm, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react';



const LeaveCreate = () => {
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Create Leave</h2>
                    </div>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormSelect id="inputUserName" label="User Name">
                                <option>Choose...</option>
                                <option>...</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect id="inputStatus" label="Status">
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                            </CFormSelect>
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput type="date" id="inputLeaveStart" label="Leave Start" />
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput type="date" id="inputLeaveEnd" label="Leave End" />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect id="inputType" label="Type">
                                <option>LWP</option>
                                <option>Paid</option>
                            </CFormSelect>
                        </CCol>
                        <CCol xs={12}>
                            <CButton type="submit" className="me-md-2">Submit</CButton>
                        </CCol>
                    </CForm>
                </div>
            </div>
        </div>
    )
}

export default LeaveCreate
