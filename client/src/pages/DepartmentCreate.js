import React, { useState } from "react";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../context/DepartmentContext";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import toast from "react-hot-toast";

const DepartmentCreate = ({ title }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const { addDepartment } = useDepartment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await addDepartment(name);
      if (data.error) {
        toast.error(data.message)
      } else {
        navigate("/dashboard/department/list");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout title={title}>
      <div className="mb-3">
        <h2 className="mb-5 mt-2">Create Department</h2>
      </div>
      <CForm className="row g-3" onSubmit={handleSubmit}>
        <CCol sm={12}>
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
