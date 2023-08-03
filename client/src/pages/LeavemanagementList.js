import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Layout from "./Layout";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useLeaveManagement } from "../context/LeaveManagementContext";
import { CButton, CForm, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";

const LeaveManagementList = () => {
  const { getLeavesMonthWise, getSingleLeave, updateLeave } = useLeaveManagement();
  const [isLoading, setIsLoading] = useState(true);
  const [leavelist, setLeaveList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [leave, setLeave] = useState("");
  const [leaveId, setLeaveId] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [month, setMonth] = useState(null)
  
  const fetchLeaves = async (query) => {
    setIsLoading(true);
    let leaveManagementData = await getLeavesMonthWise(
      currentPage,
      rowsPerPage,
      query
    );

    const totalRecordsCount = leaveManagementData.totalLeaves;
    setTotalRecords(totalRecordsCount);
    setLeaveList(leaveManagementData.leaves);
    setIsLoading(false);
  };
  useEffect(() => {
    fetchLeaves();
  }, [currentPage, rowsPerPage]);

  const singleDepartment = async () => {
    const data = await getSingleLeave(leaveId);
    if (data) {
      setLeave(data.leave);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (leaveId !== null) {
      singleDepartment();
    }
  }, [leaveId]);

  const handleChange = async (e) => {
    e.preventDefault();
    try {
      const id = leaveId;
      const getMonth = new Date(month)
      const m = getMonth.getMonth() + 1 ;
      await updateLeave(leave, id);
      setVisible(false)
      fetchLeaves(m)
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    fetchLeaves(globalFilterValue);
  };

  useEffect(() => {
    if (globalFilterValue.trim() === "") {
      fetchLeaves();
    }
  }, [globalFilterValue, currentPage, rowsPerPage]);

  const onPageChange = (event) => {
    const currentPage = Math.floor(event.first / event.rows) + 1;
    setCurrentPage(currentPage);
    const newRowsPerPage = event.rows;
    setRowsPerPage(newRowsPerPage);
  };

  const handleUpdate = async (id, fullName, monthly) => {
    setVisible(!visible);
    setLeaveId(id);
    setFullName(fullName)
    setMonth(monthly)
  };

  const actionTemplate = (rowData) => {
    return(
    <div>
      <Button
        icon="pi pi-pencil"
        rounded
        severity="info"
        className="ms-2"
        title="Edit"
        onClick={() => handleUpdate(rowData._id,  rowData.user.fullName, rowData.monthly)}
        raised
      />
    </div>
  )};

  return (
    <Layout>
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
            <CForm onSubmit={handleChange}>
              <CModalBody>
                <CFormInput
                  type="number"
                  id="leave"
                  label="Manage Leave"
                  value={leave}
                  onChange={(e) => setLeave(e.target.value) }
                />
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisible(false)}>
                  Close
                </CButton>
                <CButton color="primary" type="submit">Save changes</CButton>
              </CModalFooter>
            </CForm>
          </CModal>
          <div className="card mb-5">
            {/* Header section */}
            <div className="mainHeader d-flex align-items-center justify-content-between ">
              <div>
                <h4>Manage Leave</h4>
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
              rows={rowsPerPage}
              value={leavelist}
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
                field="user.fullName"
                header="Emp. Name"
                filterField="employeeName"
                align="center"
              />
              <Column
                field="leave"
                header="Leaves"
                filterField="leaves"
                align="center"
              />
              <Column
                field="action"
                header="Action"
                body={actionTemplate}
                align="center"
              />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default LeaveManagementList;
