import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useDepartment } from '../context/DepartmentContext';
import { useNavigate } from 'react-router-dom';
import { AiTwotoneDelete, AiTwotoneEdit } from 'react-icons/ai';
import Layout from './Layout';
import Loader from '../components/Loader';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';



const DepartmentList = () => {
  const { getDepartment, deleteDepartment } = useDepartment();
  const [isLoading, setIsLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    fetchDepartments(globalFilterValue)
  };

  useEffect(() => {
    if (globalFilterValue.trim() === '') {
      fetchDepartments();
    }
  }, [globalFilterValue])

  const renderHeader = () => {
    return (
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h4>Departments</h4>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="p-inputgroup ">
              <span className="p-inputgroup-addon">
                <i className="pi pi-search" />
              </span>
              <InputText
                type='search'
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
      'Are you sure you want to delete this department?'
    );
    if (confirmDelete) {
      await deleteDepartment(id);
      fetchDepartments();
    }
  };

  const handleUpdate = async (id) => {
    navigate(`/dashboard/department/update/${id}`);
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, rowsPerPage, sortOrder]);

  const fetchDepartments = async (query) => {
    setIsLoading(true);
    console.log(sortField, sortOrder)
    let departmentData = {};
    if (query) {
      departmentData = await getDepartment(
        currentPage,
        rowsPerPage,
        query,
        sortField,
        sortOrder
      );
    } else {
      departmentData = await getDepartment(
        currentPage,
        rowsPerPage,
        null,
        sortField,
        sortOrder
      );
    }

    // Simulating API request delay
    const totalRecordsCount = departmentData.totalDepartments;

    setTotalRecords(totalRecordsCount);
    setDepartmentList(departmentData.departments)
    setIsLoading(false);
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

  const hanldeSorting = async (e) => {
    console.log("hyyy", e)
    const field = e.sortField;
    const order = e.sortOrder;

    setSortField(field);
    setSortOrder(order);
    fetchDepartments()
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
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={hanldeSorting}
              paginator
              rows={rowsPerPage}
              value={departmentList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="_id"
              header={header}
              emptyMessage="No departments found."
              paginatorLeft={
                <Dropdown
                  value={rowsPerPage}
                  options={[10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column
                field="name"
                header="Name"
                sortable
                filterField="name"
                filterMenuStyle={{ width: '14rem' }}
                style={{ minWidth: '12rem' }}
              />
              <Column
                field="action"
                header="Action"
                body={actionTemplate}
                style={{ width: '8rem' }}
              />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DepartmentList;
