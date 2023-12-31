import React, { useEffect, useState } from "react";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../context/DepartmentContext";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from '../components/Loader'
import Layout from "./Layout";

const DepartmentUpdate = ({ title }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true)
  const { updateDepartment, getSingleDepartment } = useDepartment();
  const { toast } = useAuth();

  const singleDepartment = async () => {
    const data = await getSingleDepartment(params.id)
    if (data) {
      setName(data.name)
      setIsLoading(false)
    }
  }
  useEffect(() => {
    singleDepartment()
  }, [params.id])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = params.id
      await updateDepartment(name, id);
      navigate("/dashboard/department/list");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout title={title} toast={toast}>
      {isLoading === true && <Loader />}
      {isLoading === false && <>
        <div className="mb-3">
          <h2 className="mb-5 mt-2">Update Department</h2>
        </div>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol sm={12}>
            <CFormInput
              placeholder="Department"
              aria-label="Department"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </CCol>
          <CCol xs="auto">
            <CButton type="submit" className="me-md-2">Submit</CButton>
          </CCol>
        </CForm>
      </>}
    </Layout>
  );
};

export default DepartmentUpdate;
