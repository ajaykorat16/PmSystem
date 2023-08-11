import React from "react";
import { CCol, CFormInput, CButton, CForm, CFormTextarea } from "@coreui/react";
import Layout from "./Layout";

const ProjectCreate = ({ title }) => {

  return (
    <Layout title={title}>
      <div className="mb-3">
        <h2 className="mb-5 mt-2">Create Project</h2>
      </div>
      <CForm className="row g-3">
        <CCol md={6}>
          <CFormInput id="inputName" label="Name" />
        </CCol>
        <CCol md={6}>
          <CFormInput id="inputDate" label="Date" type="date" />
        </CCol>
        <CCol md={6}>
          <CFormTextarea id="inputDescription" label="Description" />
        </CCol>
        <CCol xs={12}>
          <CButton type="submit">Submit</CButton>
        </CCol>
      </CForm>
    </Layout>
  );
};

export default ProjectCreate;
