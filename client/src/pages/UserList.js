import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Layout from "./Layout";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useAuth } from "../context/AuthContext";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import "../styles/Styles.css";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";

const UserList = ({ title }) => {
  const navigate = useNavigate();
  const { deleteUser, getAllUsers, getUserProfile, getAllEmployee } = useUser();
  const { loginUserByAdmin, toast, auth } = useAuth()
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [userDetail, setUserDetail] = useState({
    photo: "",
    phone: "",
    fullName: "",
    email: "",
    address: "",
    departments: "",
    dateOfBirth: "",
    dateOfJoining: "",
  })

  const fetchUsers = async (currentPage, rowsPerPage, query, sortField, sortOrder) => {
    setIsLoading(true);
    let userData;
    if (auth.user.role === "admin") {
      userData = await getAllUsers(currentPage, rowsPerPage, query, sortField, sortOrder);
    } else {
      userData = await getAllEmployee(currentPage, rowsPerPage, query, sortField, sortOrder);
    }
    const totalRecordsCount = userData.totalUsers;
    setTotalRecords(totalRecordsCount);
    setUserList(userData.users);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
  }, [currentPage, rowsPerPage, sortField, sortOrder]);

  const handleSubmit = async () => {
    setCurrentPage(1);
    fetchUsers(1, rowsPerPage, globalFilterValue, sortField, sortOrder);
  };

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      setCurrentPage(1);
      fetchUsers(1, rowsPerPage, "", sortField, sortOrder);
    }
  }, [globalFilterValue, rowsPerPage, sortField, sortOrder]);

  const handleDelete = async (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this user?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      position: 'top',
      accept: async () => {
        await deleteUser(id);
        fetchUsers(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
      },
    });
  };

  const handleUpdate = async (id) => { navigate(`/dashboard/user/update/${id}`); };

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
    fetchUsers(currentPage, rowsPerPage, globalFilterValue, field, order);
  };

  const handleLogin = async (id) => {
    const { getProfile } = await getUserProfile(id)
    await loginUserByAdmin(getProfile.email)
    navigate("/")
  }

  const handleViewEmployeeProfile = async (user) => {
    setVisible(true)
    setUserDetail({
      photo: user.photo,
      phone: user.phone,
      fullName: user.fullName,
      email: user.email,
      address: user.address,
      departments: user.department,
      dateOfBirth: user.dateOfBirth,
      dateOfJoining: user.dateOfJoining,
    })
  }

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
            className='mainBody'
          >
            <CModalHeader>
              <CModalTitle><strong>{userDetail.fullName}</strong></CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="row">
                <div className="col d-flex justify-content image-container mb-3">
                  <>
                    <Avatar
                      image={userDetail.photo}
                      icon={!userDetail.photo ? 'pi pi-user' : null}
                      size={!userDetail.photo ? 'xlarge' : null}
                      shape="circle"
                      style={{
                        width: '250px',
                        height: '250px',
                        backgroundColor: !userDetail.photo ? '#2196F3' : null,
                        color: !userDetail.photo ? '#ffffff' : null
                      }}
                    />
                  </>
                </div>
                <div className="col userInfo">
                  <div className='detail'>
                    <div className='row userDetail'>
                      <div className='col'><strong> Email </strong> </div>
                      <div className='col'>{userDetail.email}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong> Department </strong> </div>
                      <div className='col'>{userDetail.departments}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong> Phone </strong> </div>
                      <div className='col'>{userDetail.phone}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong>Date Of Birth</strong></div>
                      <div className='col'>{userDetail.dateOfBirth}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'> <strong> Date Of Joining </strong></div>
                      <div className='col'>{userDetail.dateOfJoining}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong> Address </strong> </div>
                      <div className='col'>{userDetail.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="primary" onClick={() => setVisible(false)}>
                Ok
              </CButton>
            </CModalFooter>
          </CModal>
          <div className="card mb-5">
            <div className="mainHeader d-flex align-items-center justify-content-between">
              <div>
                <h4>Users</h4>
              </div>
              <div className="d-flex">
                <form onSubmit={handleSubmit}>
                  <div className="p-inputgroup ">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search" />
                    </span>
                    <InputText type="search" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} placeholder="Search" />
                  </div>
                </form>
                {auth.user.role === "admin" &&
                  <div className="ms-3">
                    <CButton
                      onClick={() => navigate('/dashboard/user/create')}
                      title="Create User"
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
              value={userList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="_id"
              emptyMessage="No user found."
              paginatorLeft={
                <Dropdown value={rowsPerPage} options={[10, 25, 50]} onChange={(e) => setRowsPerPage(e.value)} />
              }
            >
              <Column
                header="#"
                filterField="representative"
                body={(rowData) => (
                  <div className="flex align-items-center gap-2">
                    {rowData.photo ? (
                      <Avatar image={`${rowData.photo}`} size="large" shape="circle" />
                    ) : (
                      <Avatar icon="pi pi-user" className="avatar" size="large" shape="circle" />
                    )}
                  </div>
                )}
                align="center"
              />
              <Column field="employeeNumber" header="Emp. ID." sortable filterField="employeeNumber" align="center" />
              <Column field="fullName" sortable header="Name" filterField="firstname" align="center" />
              <Column field="email" sortable header="Email" filterField="email" align="center" />
              <Column field="phone" header="Phone" filterField="phone" align="center" />
              <Column field="department" header="Department" filterField="department" align="center" />
              <Column
                field="action"
                header="Action"
                body={(rowData) => (
                  <div>
                    {rowData.role === "user" && auth.user.role === "admin" && (
                      <>
                        <Button icon="pi pi-pencil" title="Edit" rounded severity="success" aria-label="edit" onClick={() => handleUpdate(rowData._id)} />
                        <Button icon="pi pi-trash" title="Delete" rounded severity="danger" className="ms-2" aria-label="Cancel" onClick={() => handleDelete(rowData._id)} />
                        <Button icon="pi pi-lock" title="User Login" rounded severity="info" className="ms-2" aria-label="login" onClick={() => handleLogin(rowData._id)} />
                      </>
                    )}
                    {auth.user.role === "user" && (
                      <Button
                        icon="pi pi-eye"
                        title="View Profile"
                        rounded
                        severity="success"
                        aria-label="view"
                        onClick={() => handleViewEmployeeProfile(rowData)}
                      />
                    )}
                  </div>
                )}
                align="center"
              />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default UserList;
