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
import "../styles/Styles.css";

const UserList = ({ title }) => {
  const { deleteUser, getAllUsers } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();

  const fetchUsers = async (query, sortField, sortOrder) => {
    setIsLoading(true);
    let usertData = await getAllUsers(
      currentPage,
      rowsPerPage,
      query,
      sortField,
      sortOrder
    );
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      await deleteUser(id);
      fetchUsers();
    }
  };
  
  const handleUpdate = async (id) => {
    navigate(`/dashboard/user/update/${id}`);
  };

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

  return (
    <Layout title={title}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="card mb-5">
            <div className="mainHeader d-flex align-items-center justify-content-between">
              <div>
                <h4>Users</h4>
              </div>
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="p-inputgroup ">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search" />
                    </span>
                    <InputText
                      type="search"
                      value={globalFilterValue}
                      onChange={(e) => setGlobalFilterValue(e.target.value)}
                      placeholder="Keyword Search"
                    />
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
                sortable
                filterField="employeeNumber"
                align="center"
              />
              <Column
                field="fullName"
                sortable
                header="Name"
                filterField="firstname"
                align="center"
              />
              <Column
                field="email"
                sortable
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
                    {rowData.role === "user" && (
                      <>
                        <Button
                          icon="pi pi-pencil"
                          title="Edit"
                          rounded
                          severity="success"
                          aria-label="edit"
                          onClick={() => handleUpdate(rowData._id)}
                        />
                        <Button
                          icon="pi pi-trash"
                          title="Delete"
                          rounded
                          severity="danger"
                          className="ms-2"
                          aria-label="Cancel"
                          onClick={() => handleDelete(rowData._id)}
                        />
                      </>
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
