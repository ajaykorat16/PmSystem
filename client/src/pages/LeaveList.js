import React, { useEffect, useState } from "react";
import { useLeave } from "../context/LeaveContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import moment from "moment";
import { AiTwotoneDelete, AiTwotoneEdit } from "react-icons/ai";
import Layout from "./Layout";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const LeaveList = () => {
  const { getLeave, deleteLeave } = useLeave();
  const [leaveList, setLeaveList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();

  const fetchLeaves = async (query, sortField, sortOrder) => {
    setIsLoading(true);
    let leaveData = await getLeave(currentPage, rowsPerPage, query, sortField, sortOrder);
    // if (query) {
    //   leaveData = await getLeave(currentPage, rowsPerPage, query, sortField, sortOrder);
    // } else {
    //   leaveData = await getLeave(currentPage, rowsPerPage, sortField, sortOrder);
    // }
    const totalRecordsCount = leaveData.totalLeaves;
    setTotalRecords(totalRecordsCount);
    setLeaveList(leaveData.leaves);
    setIsLoading(false);
  };
  // useEffect(() => {
  //   fetchLeaves();
  // }, [currentPage, rowsPerPage, sortOrder]);

  const handleSubmit = async () => {
    fetchLeaves(globalFilterValue);
  };

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
                <i className="pi pi-lo" />
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
      "Are you sure you want to delete this leave"
    );
    if (confirmDelete) {
      await deleteLeave(id);
    }
  };
  const handleUpdate = async (id) => {
    navigate(`/dashboard/leave/update/${id}`);
  };
  const actionTemplate = (rowData) => (
    <div>
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
    fetchLeaves(null, field, order)
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
              value={leaveList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="_id"
              header={header}
              emptyMessage="No leave found."
              paginatorLeft={
                <Dropdown
                  value={rowsPerPage}
                  options={[5, 10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column field="index" header="#" filterField="index" />
              <Column field="userId.fullName" sortable header="Name" filterField="name" />
              <Column
                field="reason"
                header="Reason"
                filterField="reason"
              />
              <Column field="startDate" body={start} header="Start Date" sortable filterField="start" />
              <Column body={end} header="End Date" filterField="end" />
              <Column field="type" header="Type" filterField="type" />
              <Column field="status" header="Status" filterField="status" />
              <Column field="action" header="Action" body={actionTemplate} />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default LeaveList;
