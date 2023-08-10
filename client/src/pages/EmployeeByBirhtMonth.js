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

const EmployeeByBirthMonth = ({ title }) => {
  const { getAllUsersByBirthMonth } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [sortField, setSortField] = useState("dateOfBirth");
  const [sortOrder, setSortOrder] = useState(1);
  const [photo, setPhoto] = useState("");
  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState()
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [departments, setDepartments] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");

  const fetchUsers = async (query, sortField, sortOrder) => {
    setIsLoading(true);
    let usertData
    if (!query) {
      usertData = await getAllUsersByBirthMonth(
        currentPage,
        rowsPerPage,
        sortField,
        sortOrder
      );
    } else {
      let month = parseInt(query, 10);
      usertData = await getAllUsersByBirthMonth(
        currentPage,
        rowsPerPage,
        month,
        sortField,
        sortOrder
      );
    }

    const totalRecordsCount = usertData.totalUsers;
    setTotalRecords(totalRecordsCount);
    setUserList(usertData.users);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage]);

  const handleSubmit = async () => {
    fetchUsers(globalFilterValue);
  };

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      fetchUsers();
    }
  }, [globalFilterValue, currentPage, rowsPerPage]);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    setGlobalFilterValue(currentMonth.toString());
    fetchUsers(currentMonth);
  }, []);

  const onPageChange = (event) => {
    const currentPage = Math.floor(event.first / event.rows) + 1;
    setCurrentPage(currentPage);
    const newRowsPerPage = event.rows;
    setRowsPerPage(newRowsPerPage);
  };

  const hanldeSorting = async (e) => {
    const field = e.sortField;
    const order = e.sortOrder;
    setSortField(field);
    setSortOrder(order);
    fetchUsers(null, field, order);
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
                <select className="box" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)}>
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
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
                <Dropdown
                  value={rowsPerPage}
                  options={[10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column
                header="#"
                filterField="representative"
                body={(rowData) => (
                  <div className="flex align-items-center gap-2">
                    {rowData.photo ? (
                      <Avatar
                        image={`${rowData.photo}`}
                        size="large"
                        shape="circle"
                      />
                    ) : (
                      <Avatar
                        icon="pi pi-user"
                        style={{ backgroundColor: "#2196F3", color: "#ffffff" }}
                        size="large"
                        shape="circle"
                      />
                    )}
                  </div>
                )}
                align="center"
              />
              <Column
                field="employeeNumber"
                header="Emp. ID."
                filterField="employeeNumber"
                align="center"
              />
              <Column
                field="fullName"
                header="Name"
                filterField="firstname"
                align="center"
              />
              <Column
                field="email"
                header="Email"
                filterField="email"
                align="center"
              />
              <Column
                field="phone"
                header="Phone"
                filterField="phone"
                align="center"
              />
              <Column
                field="dateOfBirth"
                header="DOB"
                filterField="dateOfBirth"
                align="center"
              />
              <Column
                field="dateOfJoining"
                header="DOJ"
                filterField="dateOfJoining"
                align="center"
              />
              <Column
                field="department"
                header="Department"
                filterField="department"
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
                        rounded
                        severity="success"
                        aria-label="edit"
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

export default EmployeeByBirthMonth;
