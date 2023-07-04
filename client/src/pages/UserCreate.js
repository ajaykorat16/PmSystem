import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { CForm, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react';



const UserCreate = () => {
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <AppHeader />
                <div className="body flex-grow-1 px-3">
                    <div className="mb-3">
                        <h2 className='mb-5 mt-2'>Create User</h2>
                    </div>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormInput id="inputFirstName" label="First Name" />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput id="inputLastName" label="Last Name" />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput type="email" id="inputEmail4" label="Email" />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput type="password" id="inputPassword4" label="Password" />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput type="number" id="inputPhone" label="Phone Number" />
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput id="inputAddress" label="Address" placeholder="1234 Main St" />
                        </CCol>
                        <CCol md={4}>
                            <CFormSelect id="inputDepartment" label="Department">
                                <option>Choose...</option>
                                <option>...</option>
                            </CFormSelect>
                        </CCol>
                        <CCol xs={4}>
                            <CFormInput type="date" id="inputJoining" label="Date Of Joining" />
                        </CCol>
                        <CCol xs={4}>
                            <CFormInput type="date" id="inputBirth" label="Date Of Birth" />
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

export default UserCreate
