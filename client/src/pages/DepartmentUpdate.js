import React, { useEffect, useState } from "react";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../context/DepartmentContext";
import { useNavigate, useParams } from "react-router-dom";
import Loader from '../components/Loader'


const DepartmentCreate = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true)
  const { updateDepartment, getSingleDepartment } = useDepartment();

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
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          {isLoading === true && <Loader />}
          {isLoading === false && <>
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
          </>}
        </div>
      </div>
    </div>
  );
};

export default DepartmentCreate;
