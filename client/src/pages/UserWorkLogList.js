import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useWorklog } from "../context/WorklogContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Layout from "./Layout";
import { Button } from "primereact/button";
import "../styles/Styles.css";


const UserWorkLogList = ({ title }) => {
  const { getWorklog, deleteWorklog } = useWorklog();
  const [isLoading, setIsLoading] = useState(true);
  const [worklogList, setWorklogList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();

  const fetchWorklog = async (query, sortField, sortOrder) => {
    setIsLoading(true);
    let worklogData = await getWorklog(
      currentPage,
      rowsPerPage,
      query,
      sortField,
      sortOrder
    );
    const totalRecordsCount = worklogData.totalWorklog;
    setTotalRecords(totalRecordsCount);
    setWorklogList(worklogData.worklog);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorklog();
  }, [currentPage, rowsPerPage]);

  const handleSubmit = async () => {
    fetchWorklog(globalFilterValue);
  };

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      fetchWorklog();
    }
  }, [globalFilterValue, currentPage, rowsPerPage]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      await deleteWorklog(id);
      fetchWorklog();
    }
  };

  const handleUpdate = async (id) => {
    navigate(`/dashboard-user/workLog/update/${id}`);
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
    fetchWorklog(null, field, order);
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
                <h4>Work Log</h4>
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
              value={worklogList}
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
                field="project.name"
                header="Project Name"
                sortable
                filterField="Project"
                align="center"
              />
               <Column
                field="description"
                header="Description"
                filterField="description"
                alignHeader="center"
                style={{ minWidth: "15rem", maxWidth: "15rem" }}
              />
              <Column
                field="logDate"
                sortable
                header="Log Date"
                filterField="logDate"
                align="center"
              />
              <Column
                field="time"
                sortable
                header="Time"
                filterField="time"
                align="center"
              />
              <Column
                field="action"
                header="Action"
                body={(rowData) => (
                  <div>
                    <>
                      <Button
                        icon="pi pi-pencil"
                        rounded
                        severity="success"
                        aria-label="edit"
                        onClick={() => handleUpdate(rowData._id)}
                      />
                      <Button
                        icon="pi pi-trash"
                        rounded
                        severity="danger"
                        className="ms-2"
                        aria-label="Cancel"
                        onClick={() => handleDelete(rowData._id)}
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
}

export default UserWorkLogList