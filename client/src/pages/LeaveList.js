import React, { useEffect, useState } from "react";
import { useLeave } from "../context/LeaveContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Layout from "./Layout";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../context/AuthContext";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { toast } from "react-hot-toast";
import { CButton, CForm, CFormTextarea, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";

const LeaveList = ({ title }) => {
  const { getLeave, getUserLeave, updateStatus } = useLeave();
  const [leaveList, setLeaveList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [fullName, setFullName] = useState(null);
  const [id, setId] = useState(null);
  const [reasonForLeaveReject, setReasonForLeaveReject] = useState("")
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
  useEffect(() => {
    fetchLeaves();
  }, [currentPage, rowsPerPage]);

  const handleSubmit = async () => {
    fetchLeaves(globalFilterValue);
  };

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      fetchLeaves();
    }
  }, [globalFilterValue, currentPage, rowsPerPage]);

  const handleUpdate = async (id) => {
    navigate(`/dashboard/leave/update/${id}`);
  };

  const handleUpdateStatus = async (id, status, fullName) => {
    try {
      if (status === 'rejected') {
        setVisible(true)
        setFullName(fullName)
        setId(id)
      } else {
        await updateStatus(status, id);
        toast.success("Leave approved successfully!!");
        fetchLeaves();
      }
    } catch (error) {
      console.log(error);
    }
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

  const handleSubmitReject = async () => {
    if (reasonForLeaveReject !== "") {
      await updateStatus("rejected", id, reasonForLeaveReject);
      toast.success("Leave rejected successfully!!");
      fetchLeaves();
      setVisible(false);
    } else {
      toast.error("Please write reason for leave reject !")
    }
  };

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
          >
            <CModalHeader>
              <CModalTitle>{fullName}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleUpdateStatus}>
              <CModalBody>
                <CFormTextarea
                  type="text"
                  id="leave"
                  label="Rasone For Reject Leave"
                  value={reasonForLeaveReject}
                  onChange={(e) => setReasonForLeaveReject(e.target.value)}
                  rows={3}
                />
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisible(false)}>
                  Close
                </CButton>
                <CButton color="primary" onClick={() => handleSubmitReject()}>Save changes</CButton>
              </CModalFooter>
            </CForm>
          </CModal>
          <div className="card mb-5">
            <div className="mainHeader d-flex align-items-center justify-content-between">
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
              emptyMessage="No leave found."
              paginatorLeft={
                <Dropdown
                  value={rowsPerPage}
                  options={[10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
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
                field="reasonForLeaveReject"
                header="Reason For Leave Reject"
                filterField="reason"
                alignHeader="center"
                style={{ minWidth: "15rem", maxWidth: "15rem" }}
              />
              <Column
                field="startDate"
                header="Start Date"
                sortable
                filterField="start"
                align="center"
              />
              <Column
                field="endDate"
                header="End Date"
                filterField="end"
                align="center"
              />
              <Column
                field="totalDays"
                header="Days"
                filterField="days"
                align="center"
              />
              <Column
                field="type"
                header="Type"
                filterField="type"
                align="center"
              />
              <Column
                header="Status"
                alignHeader="center"
                body={(rowData) => (
                  <Tag
                    value={rowData.status}
                    severity={getSeverity(rowData.status)}
                  />
                )}
                filterField="status"
                align="center"
              />
              {auth.user.role === "admin" && (
                <Column
                  header="Action"
                  body={(rowData) => (
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
                            onClick={() => handleUpdateStatus(rowData._id, "rejected", rowData.userId.fullName)}
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
                        disabled={rowData.status === "Approved" || rowData.status === "Rejected"}
                      />
                    </div>
                  )}
                  align="right"
                  alignHeader="center"
                  style={{ maxWidth: "8rem" }}
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
