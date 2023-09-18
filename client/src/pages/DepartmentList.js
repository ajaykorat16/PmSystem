import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useDepartment } from '../context/DepartmentContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Loader from '../components/Loader';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

const DepartmentList = ({ title }) => {
  const { getDepartment, deleteDepartment } = useDepartment();
  const [isLoading, setIsLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();

  const fetchDepartments = async (currentPage, rowsPerPage, query, sortField, sortOrder) => {
    setIsLoading(true);
    let departmentData = await getDepartment(currentPage, rowsPerPage, query, sortField, sortOrder);

    const totalRecordsCount = departmentData.totalDepartments;
    setTotalRecords(totalRecordsCount);
    setDepartmentList(departmentData.departments)
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDepartments(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
  }, [currentPage, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    if (globalFilterValue.trim() === '') {
      setCurrentPage(1);
      fetchDepartments(1, rowsPerPage, "", sortField, sortOrder);
    }
  }, [globalFilterValue, rowsPerPage, sortField, sortOrder])

  const handleSubmit = async () => {
    setCurrentPage(1);
    fetchDepartments(1, rowsPerPage, globalFilterValue, sortField, sortOrder)
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this department?'
    );
    if (confirmDelete) {
      await deleteDepartment(id);
      fetchDepartments(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    }
  };

  const handleUpdate = async (id) => {
    navigate(`/dashboard/department/update/${id}`);
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
    fetchDepartments(currentPage, rowsPerPage, globalFilterValue, field, order)
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
            <DataTable
              totalRecords={totalRecords}
              lazy
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSorting}
              paginator
              rows={rowsPerPage}
              value={departmentList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="_id"
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
                body={(rowData) => (
                  <div>
                    <Button icon="pi pi-pencil" title='Edit' rounded severity="success" aria-label="edit" onClick={() => handleUpdate(rowData._id)} />
                    <Button icon="pi pi-trash" title='Delete' rounded severity="danger" className="ms-2" aria-label="Cancel" onClick={() => handleDelete(rowData._id)} />
                  </div>
                )}
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
