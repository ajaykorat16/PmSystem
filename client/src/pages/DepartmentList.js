import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useDepartment } from '../context/DepartmentContext';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { CButton } from '@coreui/react';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import Loader from '../components/Loader';

const DepartmentList = ({ title }) => {
  const { getDepartment, deleteDepartment } = useDepartment();
  const { toast, deleteTost } = useAuth()
  const [isLoading, setIsLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const [visible, setVisible] = useState(false);
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

  const clear = () => {
    deleteTost.current.clear();
    setVisible(false);
  };

  const departmentDelete = async (id) => {
    await deleteDepartment(id);
    fetchDepartments(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    clear()
  }

  const handleDelete = async (id) => {

    if (!visible) {
      setVisible(true);
      deleteTost.current.clear();
      deleteTost.current.show({
        severity: 'info',
        sticky: true,
        content: (
          <div className="flex flex-column align-items-center" style={{ flex: '1'}}>
            <div className="text-center">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem' }}></i>
              <div className="font-bold text-xl my-3">Are you sure you want to delete this department?</div>
            </div>
            <div class="text-end">
              <CButton color="info" onClick={(e) => clear(false)} className='ms-3'>No</CButton>
              <CButton color="success" className="ms-3" onClick={() => departmentDelete(id)}>Yes</CButton>
            </div>
          </div>
        )
      });
    }
    // const confirmDelete = window.confirm(
    //   'Are you sure you want to delete this department?'
    // );
    // if (confirmDelete) {
    //   await deleteDepartment(id);
    //   fetchDepartments(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    // }
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
    <Layout title={title} toast={toast} deleteTost={deleteTost} >
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
                      placeholder="Search"
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
