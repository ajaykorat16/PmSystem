import React, { useState } from "react";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../context/DepartmentContext";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

const DepartmentCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const { addDepartment } = useDepartment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDepartment(name);
      navigate("/dashboard/department/list");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <div className="mb-3">
        <h2 className="mb-5 mt-2">Create Department</h2>
      </div>
      <CForm className="row g-3" onSubmit={handleSubmit}>
        <CCol sm={4}>
          <CFormInput
            placeholder="Department"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </CCol>
        <CCol xs="auto">
          <CButton type="submit">Submit</CButton>
        </CCol>
      </CForm>
    </Layout>

  );
};

export default DepartmentCreate;
