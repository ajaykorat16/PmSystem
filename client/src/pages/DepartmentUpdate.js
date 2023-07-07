import React, { useEffect, useState } from "react";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import { CRow, CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../context/DepartmentContext";
import { useNavigate, useParams } from "react-router-dom";

const DepartmentCreate = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [name, setName] = useState();
  const { updateDepartment, getSingleDepartment } = useDepartment();

  const singleDepartment = async () => {
    const data = await getSingleDepartment(params.id)
    setName(data.name)
}

useEffect(() => {
    singleDepartment()
}, [params.id])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const id = params.id
      await updateDepartment(name,id);
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
            <h2 className="mb-5 mt-2">Update Department</h2>
          </div>
          <CForm className="row g-3" onSubmit={handleSubmit}>
              <CCol sm={4}>
                <CFormInput
                  placeholder="Department"
                  aria-label="Department"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </CCol>
              <CCol xs="auto">
                <CButton type="submit">Edit</CButton>
              </CCol>
          </CForm>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCreate;
