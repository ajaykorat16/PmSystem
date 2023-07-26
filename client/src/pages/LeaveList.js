import React, { useEffect, useState } from "react";
import { useLeave } from "../context/LeaveContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import moment from "moment";
import Layout from "./Layout";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../context/AuthContext";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { toast } from "react-hot-toast";

const LeaveList = () => {
  const { getLeave, deleteLeave, getUserLeave, updateStatus } = useLeave();
  const [leaveList, setLeaveList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const fetchLeaves = async (query, sortField, sortOrder) => {
    setIsLoading(true);
    let leaveData;
    if (auth.user.role === "admin") { 
      leaveData = await getLeave(
        currentPage,
        rowsPerPage,
        query,
        sortField,
        sortOrder
      );
    } else {
      leaveData = await getUserLeave(
        currentPage,
        rowsPerPage,
        query,
        sortField,
        sortOrder
      );
    }
    const totalRecordsCount = leaveData.totalLeaves;
    setTotalRecords(totalRecordsCount);
    setLeaveList(leaveData.leaves);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    fetchLeaves(globalFilterValue);
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      fetchLeaves();
    }
  }, [globalFilterValue, currentPage, rowsPerPage]);

  const renderHeader = () => {
    return (
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h4>Leaves</h4>
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

  const handleUpdate = async (id) => {
    navigate(`/dashboard/leave/update/${id}`);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus(status, id);
      toast.success(`${status} successfully!!`);
      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };
  const actionTemplate = (rowData) => (
    <div>
      {rowData.status === "Pending" && (
        <>
          <Button
            icon="pi pi-check"
            title="Approve"
            rounded
            severity="success"
            onClick={() => handleUpdateStatus(rowData._id, "approved")}
            raised
          />
          <Button
            icon="pi pi-times"
            title="Reject"
            rounded
            severity="danger"
            onClick={() => handleUpdateStatus(rowData._id, "rejected")}
            className="ms-2"
            raised
          />
        </>
      )}

      <Button
        icon="pi pi-pencil"
        rounded
        severity="info"
        className="ms-2"
        title="Edit"
        onClick={() => handleUpdate(rowData._id)}
        raised
      />
    </div>
  );

  const onPageChange = (event) => {
    const currentPage = Math.floor(event.first / event.rows) + 1;
    setCurrentPage(currentPage);
    const newRowsPerPage = event.rows;
    setRowsPerPage(newRowsPerPage);
  };

  const start = (rowData) => {
    return <div>{moment(rowData.startDate).format("DD-MM-YYYY")}</div>;
  };
  const end = (rowData) => {
    return <div>{moment(rowData.endDate).format("DD-MM-YYYY")}</div>;
  };

  const hanldeSorting = async (e) => {
    const field = e.sortField;
    const order = e.sortOrder;

    setSortField(field);
    setSortOrder(order);
    fetchLeaves(null, field, order);
  };

  const getSeverity = (status) => {
    switch (status) {
      case "Approved":
        return "success";

      case "Pending":
        return "warning";

      case "Rejected":
        return "danger";

      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
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
              className="text-center"
              paginator
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={hanldeSorting}
              rows={rowsPerPage}
              value={leaveList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="_id"
              header={header}
              emptyMessage="No leave found."
              paginatorLeft={
                <Dropdown
                  value={rowsPerPage}
                  options={[10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column
                field="index"
                header="#"
                filterField="index"
                align="center"
              />
              {auth.user.role === "admin" && (
                <Column
                  field="userId.fullName"
                  sortable
                  header="Name"
                  filterField="name"
                  align="center"
                />
              )}
              <Column
                field="reason"
                header="Reason"
                filterField="reason"
                alignHeader="center"
                style={{ minWidth: "15rem", maxWidth: "15rem" }}
              />
              <Column
                field="startDate"
                body={start}
                header="Start Date"
                sortable
                filterField="start"
                align="center"
              />
              <Column
                body={end}
                header="End Date"
                filterField="end"
                align="center"
              />
              <Column
                field="type"
                header="Type"
                filterField="type"
                align="center"
              />
              <Column
                field="status"
                header="Status"
                alignHeader="center"
                body={statusBodyTemplate}
                filterField="status"
                align="center"
              />
              {auth.user.role === "admin" && (
                <Column
                  field="action"
                  header="Action"
                  body={actionTemplate}
                  align="right"
                  alignHeader="center"
                  style={{ maxWidth: "8rem"}}
                />
              )}
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default LeaveList;
