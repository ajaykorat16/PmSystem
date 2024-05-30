import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useDepartment } from '../context/DepartmentContext';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import Loader from '../components/Loader';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { CButton } from '@coreui/react';

const DepartmentList = ({ title }) => {
  const { getDepartment, deleteDepartment } = useDepartment();
  const { toast } = useAuth()
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
    setDepartmentList(departmentData.data)
    setIsLoading(false);
  };

  useEffect(() => {
    if(globalFilterValue.length > 0) {
      fetchDepartments(currentPage, rowsPerPage, globalFilterValue.trim(), sortField, sortOrder);
    }
  }, [currentPage, rowsPerPage, sortField, sortOrder]);
  
  useEffect(() => {
    if (globalFilterValue.trim() === '') {
      // setCurrentPage(1);
      fetchDepartments(currentPage, rowsPerPage, "", sortField, sortOrder);
    }
  }, [globalFilterValue, sortField, sortOrder, rowsPerPage, currentPage])


  const handleSubmit = async () => {
    setCurrentPage(1);
    fetchDepartments(1, rowsPerPage, globalFilterValue.trim(), sortField, sortOrder)
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this department?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      position: 'top',
      accept: async () => {
        await deleteDepartment(id);
        fetchDepartments(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
      },
    });
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
    console.log(field);
    setSortField(field);
    setSortOrder(order);
    fetchDepartments(currentPage, rowsPerPage, globalFilterValue, field, order)
  };

  return (
    <Layout title={title} toast={toast} >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <ConfirmDialog />
          <div className="card mb-5">
            <div className="mainHeader d-flex align-items-center justify-content-between">
              <div>
                <h4>Departments</h4>
              </div>
              <div className='d-flex'>
                <form onSubmit={handleSubmit}>
                  <div className="p-inputgroup ">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search" />
                    </span>
                    <InputText
                      type='search'
                      value={globalFilterValue}
                      onChange={(e) => setGlobalFilterValue(e.target.value)}
                      placeholder="Search"
                    />
                  </div>
                </form>
                <div className="ms-3">
                  <CButton
                    onClick={() => navigate('/dashboard/department/create')}
                    title="Create Department"
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
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSorting}
              paginator
              rows={rowsPerPage}
              value={departmentList}
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange}
              dataKey="id"
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
                    <Button icon="pi pi-pencil" title='Edit' rounded severity="success" aria-label="edit" onClick={() => handleUpdate(rowData.id)} />
                    <Button icon="pi pi-trash" title='Delete' rounded severity="danger" className="ms-2" aria-label="Cancel" onClick={() => handleDelete(rowData.id)} />
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
