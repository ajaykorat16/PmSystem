import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "../context/UserContext";
import Loader from "../components/Loader";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Layout from "./Layout";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import "../styles/Styles.css";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";

const EmployeeList = ({ title }) => {
  const { getAllEmployee } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const [photo, setPhoto] = useState("");
  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState()
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [departments, setDepartments] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");

  const fetchUsers = async (currentPage, rowsPerPage, query, sortField, sortOrder) => {
    setIsLoading(true);
    let usertData = await getAllEmployee(currentPage, rowsPerPage, query, sortField, sortOrder);

    const totalRecordsCount = usertData.totalUsers;
    setTotalRecords(totalRecordsCount);
    setUserList(usertData.users);
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

  const handleViewEmployeeProfile = async (user) => {
    setVisible(true)
    setFullName(user.fullName)
    setEmail(user.email)
    setAddress(user.address)
    setDepartments(user.department)
    setDateOfBirth(user.dateOfBirth)
    setDateOfJoining(user.dateOfJoining)
    setPhoto(user.photo)
    setPhone(user.phone)
  }

  return (
    <Layout title={title}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <CModal
            alignment="center"
            visible={visible}
            onClose={() => setVisible(false)}
            className='mainBody'
          >
            <CModalHeader>
              <CModalTitle><strong>{fullName}</strong></CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="row">
                <div className="col d-flex justify-content image-container mb-3">
                  <>
                    <Avatar
                      image={photo}
                      icon={!photo ? 'pi pi-user' : null}
                      size={!photo ? 'xlarge' : null}
                      shape="circle"
                      style={{
                        width: '250px',
                        height: '250px',
                        backgroundColor: !photo ? '#2196F3' : null,
                        color: !photo ? '#ffffff' : null
                      }}
                    />
                  </>
                </div>
                <div className="col userInfo">
                  <div className='detail'>
                    <div className='row userDetail'>
                      <div className='col'><strong> Email </strong> </div>
                      <div className='col'>{email}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong> Department </strong> </div>
                      <div className='col'>{departments}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong> Phone </strong> </div>
                      <div className='col'>{phone}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong>Date Of Birth</strong></div>
                      <div className='col'>{dateOfBirth}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'> <strong> Date Of Joining </strong></div>
                      <div className='col'>{dateOfJoining}</div>
                    </div>
                    <div className='row userDetail'>
                      <div className='col'><strong> Address </strong> </div>
                      <div className='col'>{address}</div>
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
                <h4>Employee</h4>
              </div>
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="p-inputgroup ">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search" />
                    </span>
                    <InputText type="search" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} placeholder="Keyword Search" />
                  </div>
                </form>
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
              emptyMessage="No employee found."
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
              <Column field="dateOfBirth" header="DOB" filterField="dateOfBirth" align="center" />
              <Column field="dateOfJoining" header="DOJ" filterField="dateOfJoining" align="center" />
              <Column field="department" header="Department" filterField="department" align="center" />
              <Column
                field="action"
                header="Action"
                body={(rowData) => (
                  <div>
                    <>
                      <Button
                        icon="pi pi-eye"
                        title="View Profile"
                        rounded
                        severity="success"
                        aria-label="view"
                        onClick={() => handleViewEmployeeProfile(rowData)}
                      />
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
  );
};

export default EmployeeList;
