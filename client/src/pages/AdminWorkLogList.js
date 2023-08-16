import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from 'primereact/calendar';
import { ScrollPanel } from 'primereact/scrollpanel';
import Layout from "./Layout";
import Loader from "../components/Loader";
import { useWorklog } from "../context/WorklogContext";
import { useUser } from "../context/UserContext";
import { useProject } from '../context/ProjectContext';
import "../styles/Styles.css";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { Button } from "primereact/button";

function AdminWorkLogList({ title }) {
    const { getAdminWorklog } = useWorklog();
    const { fetchProjects } = useProject()
    const { fetchUsers } = useUser()
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
    const [filter, setFilter] = useState({
        userId: "",
        project: "",
        logDate: ""
    });
    const [worklog, setWorklog] = useState({
        userId: "",
        project: "",
        description: "",
        logDate: "",
        time: ""
    });

    const fetchWorklog = async (filter, sortField, sortOrder) => {
        setIsLoading(true);
        let worklogData = await getAdminWorklog(
            currentPage,
            rowsPerPage,
            filter,
            sortField,
            sortOrder
        );
        const totalRecordsCount = worklogData.totalWorklog;
        setTotalRecords(totalRecordsCount);
        setWorklogList(worklogData.worklog);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchWorklog(filter, sortField, sortOrder);
    }, [currentPage, rowsPerPage, filter, sortField, sortOrder]);

    const getRecords = async () => {
        const { getAllUsers } = await fetchUsers();
        setUsers(getAllUsers);
        const { getAllProjects } = await fetchProjects();
        setProjects(getAllProjects);
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

    const userOptions = users.map(user => ({ label: user.fullName, value: user._id }));
    const projectOptions = projects.map(project => ({ label: project.name, value: project._id }));

    const handleWorklogDetail = async (worklog) => {
        setVisible(true)
        console.log("worklog", worklog);
        setWorklog({
            userId: worklog.userId.fullName,
            project: worklog.project.name,
            description: worklog.description,
            logDate: worklog.logDate,
            time: worklog.time
        })

    }

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
                        className='mainBody'
                    >
                        <CModalHeader>
                            <CModalTitle><strong>{worklog.userId}</strong></CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div>
                                <p>
                                    <strong>{worklog.project}</strong>
                                </p>
                            </div>
                            <div className='description'>
                                <ScrollPanel style={{ width: '100%', height: '20rem' }} className="custom">
                                    <div className="description" dangerouslySetInnerHTML={{ __html: worklog.description }} />
                                </ScrollPanel>
                            </div>
                            <div className='d-flex justify-content-end '>
                                <p>
                                    <strong>{worklog.logDate}</strong>
                                </p>
                            </div>
                            <div className='d-flex justify-content-end '>
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
                                <h4>Worklog</h4>
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
                            <Column field="userId.fullName" header="Developer" filter filterElement={<Dropdown value={filter.userId} options={userOptions} onChange={(e) => setFilter({ ...filter, userId: e.value })} showClear />} />
                            <Column field="project.name" header="Project" filter filterElement={<Dropdown value={filter.project} options={projectOptions} onChange={(e) => setFilter({ ...filter, project: e.value })} showClear />} />
                            <Column
                                field="logDate"
                                header="Log Date"
                                filter
                                filterElement={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Calendar
                                            value={filter.logDate}
                                            dateFormat="dd-mm-yy"
                                            onChange={(e) => setFilter({ ...filter, logDate: e.value })}
                                            showIcon
                                            style={{ marginRight: '5px' }}
                                        />
                                        {filter.logDate !== "" &&
                                            <Button
                                                icon="pi pi-times"
                                                onClick={() => setFilter({ ...filter, logDate: "" })}
                                                className="p-button-rounded p-button-danger p-button-text"
                                            />
                                        }

                                    </div>
                                }
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
                                                rounded
                                                severity="info"
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
