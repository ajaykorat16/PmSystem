import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { ScrollPanel } from "primereact/scrollpanel";
import Layout from "./Layout";
import Loader from "../components/Loader";
import { useWorklog } from "../context/WorklogContext";
import { useUser } from "../context/UserContext";
import { useProject } from "../context/ProjectContext";
import "../styles/Styles.css";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, } from "@coreui/react";
import { Button } from "primereact/button";

function AdminWorkLogList({ title }) {
    const { getAdminWorklog } = useWorklog();
    const { fetchProjects } = useProject();
    const { fetchUsers } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [worklogList, setWorklogList] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState(-1);
    const [visible, setVisible] = useState(false);
    const [filter, setFilter] = useState({ userId: null, project: null, logDate: null, });
    const [worklog, setWorklog] = useState({ userId: "", project: "", description: "", logDate: "", time: "", });

    const fetchWorklog = async (filter, sortField, sortOrder) => {
        setIsLoading(true);
        let worklogData = await getAdminWorklog(currentPage, rowsPerPage, filter, sortField, sortOrder);
        const totalRecordsCount = worklogData.totalWorklog;
        setTotalRecords(totalRecordsCount);
        setWorklogList(worklogData.data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchWorklog(filter, sortField, sortOrder);
    }, [currentPage, rowsPerPage, filter, sortField, sortOrder]);

    const getRecords = async () => {
        const { data } = await fetchUsers();
        setUsers(data);
        const { data: projectList } = await fetchProjects();
        setProjects(projectList);
    };

    useEffect(() => {
        getRecords();
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
        fetchWorklog(null, field, order);
    };

    const userOptions = users?.map((user) => ({ label: user.fullName, value: user.id, }));
    const projectOptions = projects?.map((project) => ({ label: project.name, value: project.id, }));

    const handleWorklogDetail = async (worklog) => {
        setVisible(true);
        setWorklog({
            userId: worklog.fullName,
            project: worklog.project.name,
            description: worklog.description,
            logDate: worklog.logDate,
            time: worklog.time,
        });
    };

    const clearFilter = () => {
        setFilter({ userId: null, project: null, logDate: null, });
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
                        className="mainBody"
                    >
                        <CModalHeader>
                            <CModalTitle>
                                <strong>{worklog.userId}</strong>
                            </CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div>
                                <p>
                                    <strong>{worklog.project}</strong>
                                </p>
                            </div>
                            <div className="description">
                                <ScrollPanel
                                    className="custom"
                                >
                                    <div className="description" dangerouslySetInnerHTML={{ __html: worklog.description }} />
                                </ScrollPanel>
                            </div>
                            <div className="d-flex justify-content-end ">
                                <p>
                                    <strong>{worklog.logDate}</strong>
                                </p>
                            </div>
                            <div className="d-flex justify-content-end ">
                                <p>
                                    <strong>Time: {worklog.time} h</strong>
                                </p>
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={() => setVisible(false)}>
                                Ok
                            </CButton>
                        </CModalFooter>
                    </CModal>
                    <div className="card mb-5">
                        <div className="mainHeader d-flex align-items-center justify-content-between">
                            <div>
                                <h4>Work Log</h4>
                            </div>
                            <div>
                                <Button type="button" severity="info" icon="pi pi-filter-slash" label="Clear Filters" onClick={clearFilter} rounded raised />
                            </div>
                        </div>
                        <DataTable
                            totalRecords={totalRecords}
                            lazy
                            paginator
                            sortField={sortField}
                            sortOrder={sortOrder}
                            filterDisplay="row"
                            onSort={hanldeSorting}
                            rows={rowsPerPage}
                            value={worklogList}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="id"
                            emptyMessage="No work log found."
                            paginatorLeft={
                                <Dropdown value={rowsPerPage} options={[10, 25, 50]} onChange={(e) => setRowsPerPage(e.value)} />
                            }
                        >
                            <Column
                                // field="userId.fullName"
                                field="fullName"
                                header="Developer"
                                showFilterMenu={false}
                                filter
                                filterElement={
                                    <Dropdown value={filter.userId} options={userOptions} onChange={(e) => setFilter({ ...filter, userId: e.value })} showClear />
                                }
                                align="center"
                            />
                            <Column
                                field="projectName"
                                header="Project"
                                showFilterMenu={false}
                                filter
                                filterElement={
                                    <Dropdown value={filter.project} options={projectOptions} onChange={(e) => setFilter({ ...filter, project: e.value })} showClear />
                                }
                                align="center"
                            />
                            <Column
                                field="logDate"
                                header="Log Date"
                                showFilterMenu={false}
                                style={{ maxWidth: "10rem" }}
                                filter
                                filterElement={
                                    <Calendar
                                        value={filter.logDate}
                                        dateFormat="dd-mm-yy"
                                        onChange={(e) => setFilter({ ...filter, logDate: e.value })}
                                        maxDate={new Date()}
                                        showIcon
                                        style={{ marginRight: "5px" }}
                                    />
                                }
                                align="center"
                            />
                            <Column field="time" header="Time" filterField="time" align="center" />
                            <Column
                                field="action"
                                header="Action"
                                body={(rowData) => (
                                    <div>
                                        <>
                                            <Button
                                                icon="pi pi-eye"
                                                title="View Work Log"
                                                rounded
                                                severity="success"
                                                className="ms-2"
                                                aria-label="Cancel"
                                                onClick={() => handleWorklogDetail(rowData)}
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

export default AdminWorkLogList;
