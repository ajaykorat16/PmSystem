import React, { useEffect, useState } from "react";
import { CButton, CForm, CFormTextarea, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { useLeave } from "../context/LeaveContext";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../context/AuthContext";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

const PendingLeaves = () => {
    const navigate = useNavigate();
    const { getAllPendingLeaves, updateStatus } = useLeave();
    const { toast } = useAuth();
    const [leaveList, setLeaveList] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState(-1);
    const [visible, setVisible] = useState(false);
    const [fullName, setFullName] = useState(null);
    const [id, setId] = useState(null);
    const [reasonForLeaveReject, setReasonForLeaveReject] = useState("");
    const [viewLeave, setViewLeave] = useState(false);
    const [leaveDetail, setLeaveDetail] = useState({
        name: "",
        startDate: "",
        endDate: "",
        days: "",
        leaveType: "",
        leaveDayType: "",
        reason: "",
        reasonForReject: "",
        status: "",
    });

    const fetchLeaves = async (currentPage, rowsPerPage, query, sortField, sortOrder) => {
        let leaveData = await getAllPendingLeaves(currentPage, rowsPerPage, query, sortField, sortOrder);
        const totalRecordsCount = leaveData?.totalLeaves;
        setTotalRecords(totalRecordsCount);
        setLeaveList(leaveData?.leaves);
    };

    useEffect(() => {
        fetchLeaves(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    }, [currentPage, rowsPerPage, sortField, sortOrder]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchLeaves(1, rowsPerPage, globalFilterValue, sortField, sortOrder);
    };

    useEffect(() => {
        if (globalFilterValue.trim() === "") {
            setCurrentPage(1);
            fetchLeaves(1, rowsPerPage, "", sortField, sortOrder);
        }
    }, [globalFilterValue, rowsPerPage, sortField, sortOrder]);

    const handleUpdate = async (id) => {
        navigate(`/dashboard/leave/update/${id}`);
    };

    const handleUpdateStatus = async (id, status, fullName) => {
        try {
            if (status === "rejected") {
                setVisible(true);
                setFullName(fullName);
                setId(id);
            } else {
                await updateStatus(status, id);
                toast.current.show({ severity: 'success', summary: 'Leave', detail: "Leave is approved successfully.", life: 3000 })
                fetchLeaves(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onPageChange = (event) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchLeaves(currentPage, rowsPerPage, globalFilterValue, field, order);
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
            toast.current.show({ severity: 'success', summary: 'Leave', detail: "Leave is rejected successfully!!", life: 3000 })
            fetchLeaves(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
            setVisible(false);
        } else {
            toast.current.show({ severity: 'info', summary: 'Leave', detail: "Please write a reason for leave rejection!", life: 3000 })
        }
    };

    const handleViewLeaveDetail = async (leaveDetail) => {
        setViewLeave(true)
        setLeaveDetail({
            name: leaveDetail.userId.fullName,
            startDate: leaveDetail.startDate,
            endDate: leaveDetail.endDate,
            days: leaveDetail.totalDays,
            leaveType: leaveDetail.leaveType,
            leaveDayType: leaveDetail.leaveDayType,
            reason: leaveDetail.reason,
            reasonForReject: leaveDetail.reasonForLeaveReject,
            status: leaveDetail.status,
        })
    }

    return (
        <>
            <div>
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
                            <CButton color="primary" onClick={() => handleSubmitReject()}>Submit</CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>
            </div>
            <div>
                <CModal
                    backdrop="static"
                    alignment="center"
                    visible={viewLeave}
                    onClose={() => setViewLeave(false)}
                    className='mainBody'
                >
                    <CModalHeader>
                        <CModalTitle><strong>Leave Details</strong></CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <div className="row">
                            <div className="col userInfo">
                                <div className='detail'>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Name </strong> </div>
                                        <div className='col'>{leaveDetail.name}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Start Date </strong> </div>
                                        <div className='col'>{leaveDetail.startDate}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong>End Date</strong></div>
                                        <div className='col'>{leaveDetail.endDate}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'> <strong> Days </strong></div>
                                        <div className='col'>{leaveDetail.days}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Leave Type </strong> </div>
                                        <div className='col'>{leaveDetail.leaveType}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Leave Day Type </strong> </div>
                                        <div className='col'>{leaveDetail.leaveDayType}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Reason </strong> </div>
                                        <div className='col' style={{ wordBreak: 'break-all' }}>{leaveDetail.reason}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Reason For Reject </strong> </div>
                                        <div className='col' style={{ wordBreak: 'break-all' }}>{leaveDetail.reasonForReject}</div>
                                    </div>
                                    <div className='row userDetail'>
                                        <div className='col'><strong> Status </strong> </div>
                                        <div className='col' >{leaveDetail.status}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="primary" onClick={() => setViewLeave(false)}>
                            Ok
                        </CButton>
                    </CModalFooter>
                </CModal>
            </div>
            <div className="card mb-5">
                <div className="mainHeader d-flex align-items-center justify-content-between">
                    <div>
                        <h4>Recent Leaves</h4>
                    </div>
                    <div className="d-flex">
                        <form onSubmit={handleSubmit}>
                            <div className="p-inputgroup ">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-search" />
                                </span>
                                <InputText type="search" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} placeholder="Search" />
                            </div>
                        </form>
                        <div className="ms-3">
                            <CButton
                                onClick={() => navigate('/dashboard/leave/create')}
                                title="Create Leave"
                                className="btn btn-light"
                                style={{ height: "40px" }}
                            >
                                <i className="pi pi-plus" />
                            </CButton>
                        </div>
                    </div>
                </div>
                <DataTable
                    totalRecords={totalRecords}
                    lazy
                    className="text-center"
                    paginator
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={handleSorting}
                    rows={rowsPerPage}
                    value={leaveList}
                    first={(currentPage - 1) * rowsPerPage}
                    onPage={onPageChange}
                    dataKey="_id"
                    emptyMessage="No Pending leaves found."
                    paginatorLeft={
                        <Dropdown value={rowsPerPage} options={[5, 10, 25, 50]} onChange={(e) => setRowsPerPage(e.value)} />
                    }
                >
                    <Column field="startDate" header="Start Date" sortable filterField="start" align="center" />
                    <Column field="endDate" header="End Date" filterField="end" align="center" />
                    <Column field="userId.fullName" sortable header="Name" filterField="name" align="center" />
                    <Column field="totalDays" header="Days" filterField="days" align="center" />
                    <Column field="leaveType" header="Leave Type" filterField="leaveType" align="center" />
                    <Column
                        header="Status"
                        alignHeader="center"
                        body={(rowData) => (
                            <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
                        )}
                        filterField="status"
                        align="center"
                    />
                    <Column
                        header="Action"
                        body={(rowData) => (
                            <div>
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
                                <Button
                                    icon="pi pi-pencil"
                                    rounded
                                    severity="info"
                                    className="ms-2"
                                    title="Edit"
                                    onClick={() => handleUpdate(rowData._id)}
                                    raised
                                    disabled={rowData.status !== "Pending"}
                                />
                                <Button
                                    icon="pi pi-eye"
                                    title="View Leave Details"
                                    rounded
                                    className="ms-2"
                                    severity="success"
                                    aria-label="view"
                                    onClick={() => handleViewLeaveDetail(rowData)}
                                />
                            </div>
                        )}
                        align="right"
                        alignHeader="center"
                    />
                </DataTable>
            </div>
        </>
    )
}
export default PendingLeaves;
