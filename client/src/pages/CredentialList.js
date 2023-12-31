import React, { useEffect, useState } from "react";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useCredential } from "../context/CredentialContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Layout from "./Layout";
import "../styles/Styles.css";
import { CButton } from "@coreui/react";
const { DOMParser } = require('xmldom')

const CredentialList = ({ title }) => {
    const { getAllCredentials, deleteCredentials } = useCredential()
    const { auth, toast } = useAuth()
    const [isLoading, setIsLoading] = useState(true);
    const [credentialList, setCredentialList] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState(-1);
    const navigate = useNavigate();

    const fetchCredential = async (currentPage, rowsPerPage, query, sortField, sortOrder) => {
        setIsLoading(true);
        let credentialData = await getAllCredentials(currentPage, rowsPerPage, query, sortField, sortOrder);

        const totalRecordsCount = credentialData?.totalCredential;
        setTotalRecords(totalRecordsCount);
        setCredentialList(credentialData?.credential);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCredential(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    }, [currentPage, rowsPerPage, sortField, sortOrder]);

    const handleSubmit = async () => {
        setCurrentPage(1);
        fetchCredential(1, rowsPerPage, globalFilterValue, sortField, sortOrder);
    };

    useEffect(() => {
        if (globalFilterValue.trim() === "") {
            setCurrentPage(1);
            fetchCredential(1, rowsPerPage, "", sortField, sortOrder);
        }
    }, [globalFilterValue, rowsPerPage, sortField, sortOrder]);

    const handleDelete = async (id) => {
        confirmDialog({
            message: 'Are you sure you want to delete this Credentials?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            position: 'top',
            accept: async () => {
                await deleteCredentials(id)
                fetchCredential(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
            },
        });
    };

    const handleUpdate = async (id) => {
        const redirectPath = auth.user.role === "admin" ? `/dashboard/credential/update/${id}` : `/dashboard-user/credential/update/${id}`
        navigate(redirectPath)
    };

    const onPageChange = (event) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const hanldeSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;
        setSortField(field);
        setSortOrder(order);
        fetchCredential(currentPage, rowsPerPage, globalFilterValue, field, order);
    };

    const handleCredentialDetail = async (id) => {
        const redirect = auth?.user.role === "admin" ? `/dashboard/credential/view/${id}` : `/dashboard-user/credential/view/${id}`
        navigate(redirect)
    };

    function parseHtmlToText(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.documentElement.textContent;
    }

    return (
        <Layout title={title} toast={toast}>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <ConfirmDialog />
                    <div className="card mb-5">
                        <div className="mainHeader d-flex align-items-center justify-content-between">
                            <div>
                                <h4>Credentials</h4>
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
                                        onClick={() => { auth.user.role === "admin" ? navigate('/dashboard/credential/create') : navigate('/dashboard-user/credential/create') }}
                                        title="Create Credentials"
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
                            paginator
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onSort={hanldeSorting}
                            rows={rowsPerPage}
                            value={credentialList}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="_id"
                            emptyMessage="No credentials found."
                            paginatorLeft={
                                <Dropdown value={rowsPerPage} options={[10, 25, 50]} onChange={(e) => setRowsPerPage(e.value)} />
                            }
                        >
                            <Column field="title" header="Title" sortable filterField="title" align="center" />
                            <Column
                                field="description"
                                header="Description"
                                sortable
                                filterField="description"
                                body={(rowData) => {
                                    if (rowData.description !== "") {
                                        let description = parseHtmlToText(rowData.description)
                                        if (description.length > 30) {
                                            description = description.substring(0, 30) + '...';
                                        }
                                        return description
                                    }
                                }}
                                align="center"
                            />
                            <Column
                                field="action"
                                header="Action"
                                body={(rowData) => (
                                    <div>
                                        <>
                                            <Button icon="pi pi-pencil" title="Edit" rounded severity="success" aria-label="edit" onClick={() => handleUpdate(rowData._id)} disabled={rowData.createdBy?._id !== auth.user._id} />
                                            <Button icon="pi pi-trash" title="Delete" rounded severity="danger" className="ms-2" aria-label="Cancel" onClick={() => handleDelete(rowData._id)} disabled={rowData.createdBy?._id !== auth.user._id} />
                                            <Button icon="pi pi-eye" title="View Credentials" rounded severity="info" className="ms-2 viewCredential" aria-label="view" onClick={() => handleCredentialDetail(rowData._id)} />
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
};

export default CredentialList;
