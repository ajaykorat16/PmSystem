import React, { useState } from "react";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import { CRow, CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../context/DepartmentContext";
import { useNavigate } from "react-router-dom";

const DepartmentCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState();
  const { addDepartment } = useDepartment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDepartment(name);
      navigate("/department/list");
      console.log(name);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <div className="mb-3">
            <h2 className="mb-5 mt-2">Create Department</h2>
          </div>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">
              <CCol sm={4}>
                <CFormInput
                  placeholder="Department"
                  aria-label="Department"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </CCol>
              <CCol xs="auto">
                <CButton type="submit">Submit</CButton>
              </CCol>
            </CRow>
          </CForm>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCreate;
