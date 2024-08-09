import React, { useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Loader from '../components/Loader';
import Layout from "./Layout";
import "../styles/Styles.css";

const ProjectList = ({ title }) => {
  const navigate = useNavigate()
  const { toast, auth } = useAuth()
  const { getProject, deleteProject, userProject } = useProject()
  const [projectList, setProjectList] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [project, setProject] = useState({
    name: "",
    developers: "",
    description: "",
    startDate: "",
  });

  const fetchProjects = async (currentPage, rowsPerPage, query, sortField, sortOrder) => {
    setIsLoading(true);
    let projectData;
    if (auth.user.role === "admin") {
      projectData = await getProject(currentPage, rowsPerPage, query, sortField, sortOrder);
    } else {
      projectData = await userProject(currentPage, rowsPerPage, query, sortField, sortOrder);
    }

    if (projectData) {
      const totalRecordsCount = projectData?.totalProjects;
      setTotalRecords(totalRecordsCount);
      setProjectList(projectData.data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setCurrentPage(1);
    fetchProjects(1, rowsPerPage, globalFilterValue?.trim(), sortField, sortOrder);
  };

  useEffect(() => {
    if (globalFilterValue.length > 0) {
      fetchProjects(currentPage, rowsPerPage, globalFilterValue.trim(), sortField, sortOrder);
    }
  }, [currentPage, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    if (globalFilterValue.trim() === '') {
      fetchProjects(currentPage, rowsPerPage, "", sortField, sortOrder);
    }
  }, [globalFilterValue, sortField, sortOrder, rowsPerPage, currentPage])

  const handleDelete = async (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this project?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      position: 'top',
      accept: async () => {
        await deleteProject(id);
        fetchProjects(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
      },
    });
  };

  const handleUpdate = async (id) => {
    navigate(`/dashboard/project/update/${id}`);
  };

  const onPageChange = (event) => {
    const newCurrentPage = Math.floor(event.first / event.rows) + 1;
    setCurrentPage(newCurrentPage);
    const newRowsPerPage = event.rows;
    setRowsPerPage(newRowsPerPage);
  };

  const hanldeSorting = async (e) => {
    const field = e.sortField;
    const order = e.sortOrder;
    setSortField(field);
    setSortOrder(order);
    fetchProjects(currentPage, rowsPerPage, globalFilterValue?.trim(), field, order);
  };

  const handleProjectDetail = async (project) => {
    setVisible(true);
    const developerNames = project.developers.map(
      (developer) => developer.fullName
    );

    setProject({
      name: project.projectName,
      developers: developerNames.join(', '),
      description: project.description,
      startDate: project.startDate,
    });
  };

  return (
    <Layout title={title} toast={toast}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <ConfirmDialog />
          <CModal
            alignment="center"
            visible={visible}
            onClose={() => setVisible(false)}
            className="mainBody"
          >
            <CModalHeader>
              <CModalTitle>
                <strong>{project.name}</strong>
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              {auth.user.role === "admin" &&
                <div>
                  <strong>Developers:</strong>
                  <p>{project.developers}</p>
                </div>
              }
              <div className="description">
                <strong>Description:</strong>
                <ScrollPanel className="custom">
                  <div className="description" dangerouslySetInnerHTML={{ __html: project.description }} />
                </ScrollPanel>
              </div>
              <div className="d-flex justify-content-end ">
                <p>
                  <strong>{project.startDate}</strong>
                </p>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisible(false)}>
                Ok
              </CButton>
            </CModalFooter>
          </CModal>
          <div className="card mb-5">
            <div className="mainHeader d-flex align-items-center justify-content-between">
              <div>
                <h4>Projects</h4>
              </div>
              <div className='d-flex'>
                <form onSubmit={handleSubmit}>
                  <div className="p-inputgroup ">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search" />
                    </span>
                    <InputText
                      type="search"
                      value={globalFilterValue}
                      onChange={(e) => setGlobalFilterValue(e.target.value)}
                      placeholder="Search"
                    />
                  </div>
                </form>
                {auth.user.role === "admin" &&
                  <div className="ms-3">
                    <CButton
                      onClick={() => navigate('/dashboard/project/create')}
                      title="Create Project"
                      className="btn btn-light"
                      style={{ height: "40px" }}
                    >
                      <i className="pi pi-plus" />
                    </CButton>
                  </div>
                }
              </div>
            </div>
            <DataTable
              totalRecords={totalRecords}
              lazy
              paginator
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={hanldeSorting}
              rows={rowsPerPage}
              value={projectList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="id"
              emptyMessage="No project found."
              paginatorLeft={
                <Dropdown
                  value={rowsPerPage}
                  options={[10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column
                field="projectName"
                header="Name"
                filterField="name"
                align="center"
              />
              {auth.user.role === "admin" &&
                <Column
                  header="Developers"
                  body={(rowData) => {
                    const developerNames = rowData.developers.map(
                      (developer) => developer.fullName
                    );
                    return developerNames.join(', ');
                  }}
                  align="center"
                  style={{ maxWidth: "15rem" }}
                />
              }
              <Column
                field="startDate"
                header="Start Date"
                filterField="startDate"
                sortable
                align="center"
              />
              <Column
                field="action"
                header="Action"
                body={(rowData) => (
                  <div>
                    <>
                      <Button
                        icon="pi pi-eye"
                        title='View Project'
                        rounded
                        severity="info"
                        aria-label="Cancel"
                        onClick={() => handleProjectDetail(rowData)}
                      />
                      {auth.user.role === "admin" &&
                        <>
                          <Button
                            icon="pi pi-pencil"
                            title='Edit'
                            rounded
                            severity="success"
                            className="ms-2"
                            aria-label="edit"
                            onClick={() => handleUpdate(rowData.projectId)}
                          />
                          <Button
                            icon="pi pi-trash"
                            title='Delete'
                            rounded
                            severity="danger"
                            className="ms-2"
                            aria-label="Cancel"
                            onClick={() => handleDelete(rowData.projectId)}
                          />
                        </>
                      }
                    </>
                  </div>
                )}
                align="center"
              />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  )
}

export default ProjectList