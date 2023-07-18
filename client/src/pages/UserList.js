import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { AiTwotoneDelete, AiTwotoneEdit } from "react-icons/ai";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import "../styles/Styles.css";
import Layout from "./Layout";

const UserList = () => {
  const { users, deleteUser, getAllUsers } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async (query) => {
    setIsLoading(true);
    let usertData = {};
    if (query) {
      usertData = await getAllUsers(currentPage, rowsPerPage, query);
    } else {
      usertData = await getAllUsers(currentPage, rowsPerPage);
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
  }, [globalFilterValue]);

  const renderHeader = () => {
    return (
      <div className="d-flex align-items-center justify-content-between">
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
    );
  };
  const header = renderHeader();

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
  const actionTemplate = (rowData) => {
    return (
      <div>
        {rowData.role === "user" && (
          <>
            <AiTwotoneEdit
              color="success"
              variant="outline"
              onClick={() => handleUpdate(rowData._id)}
              className="edit"
            />
            <AiTwotoneDelete
              color="danger"
              variant="outline"
              onClick={() => handleDelete(rowData._id)}
              className="delete"
            />
          </>
        )}
      </div>
    );
  };

  const onPageChange = (event) => {
    const currentPage = Math.floor(event.first / event.rows) + 1;
    setCurrentPage(currentPage);
    const newRowsPerPage = event.rows;
    setRowsPerPage(newRowsPerPage);
  };

  const photo = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <img
          alt={rowData.name}
          src={`${rowData.photo}`}
          height="50"
          width="50"
        />
      </div>
    );
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="card mb-5">
            <DataTable
              totalRecords={totalRecords}
              lazy
              paginator
              rows={rowsPerPage}
              value={userList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="_id"
              header={header}
              emptyMessage="No user found."
              paginatorLeft={
                <Dropdown
                  value={rowsPerPage}
                  options={[5, 10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column header="#" filterField="representative" body={photo} />
              <Column
                field="employeeNumber"
                header="Emp. ID."
                filterField="employeeNumber"
              />
              <Column field="name" header="Name" filterField="firstname" />
              <Column field="email" header="Email" filterField="email" />
              <Column field="phone" header="Phone" filterField="phone" />
              <Column
                field="dateOfBirth"
                header="DOB"
                filterField="dateOfBirth"
              />
              <Column
                field="dateOfJoining"
                header="DOJ"
                filterField="dateOfJoining"
              />
              <Column
                field="department"
                header="Department"
                filterField="department"
              />
              <Column field="action" header="Action" body={actionTemplate} />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default UserList;
