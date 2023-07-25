import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Layout from "./Layout";
import moment from "moment";
import "../styles/Styles.css"
import { Button } from "primereact/button";
import { Avatar } from 'primereact/avatar';

const UserList = () => {
  const { deleteUser, getAllUsers } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();

  const fetchUsers = async (query, sortField, sortOrder) => {
    setIsLoading(true);
    let usertData = await getAllUsers(currentPage, rowsPerPage, query, sortField, sortOrder);

    const totalRecordsCount = usertData.totalUsers;
    setTotalRecords(totalRecordsCount);
    setUserList(usertData.users);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    fetchUsers(globalFilterValue);
  };

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      fetchUsers();
    }
  }, [globalFilterValue, currentPage, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage]);

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
            <Button icon="pi pi-pencil" rounded severity="success" aria-label="edit" onClick={() => handleUpdate(rowData._id)} />
            <Button icon="pi pi-trash" rounded severity="danger" className="ms-2" aria-label="Cancel" onClick={() => handleDelete(rowData._id)} />

            {/* <AiTwotoneEdit
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
            /> */}
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
        {rowData.photo ? (
          <Avatar image={`${rowData.photo}`} size="large" shape="circle" />
        ) : (
          <Avatar icon="pi pi-user" style={{ backgroundColor: '#2196F3', color: '#ffffff' }} size="large" shape="circle" />
        )}
      </div>
    );
  };

  const DOB = (rowData) => {
    return (
      <div>
        {moment(rowData.dateOfBirth).format('DD-MM-YYYY')}
      </div>
    )
  }

  const DOJ = (rowData) => {
    return (
      <div>
        {moment(rowData.dateOfJoining).format('DD-MM-YYYY')}
      </div>
    )
  }

  const hanldeSorting = async (e) => {
    const field = e.sortField;
    const order = e.sortOrder;

    setSortField(field);
    setSortOrder(order);
    fetchUsers(null, field, order)
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
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={hanldeSorting}
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
                  options={[10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column header="#" filterField="representative" body={photo} />
              <Column
                field="employeeNumber"
                header="Emp. ID."
                sortable
                filterField="employeeNumber"
              />
              <Column field="fullName" sortable header="Name" filterField="firstname" />
              <Column field="email" sortable header="Email" filterField="email" />
              <Column field="phone" header="Phone" filterField="phone" />
              <Column
                body={DOB}
                header="DOB"
                filterField="dateOfBirth"
              />
              <Column
                body={DOJ}
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
