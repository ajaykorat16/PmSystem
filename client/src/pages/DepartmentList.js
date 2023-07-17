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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
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
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <form onSubmit={handleSubmit}>
          <InputText
            value={globalFilterValue}
            onChange={(e) =>  setGlobalFilterValue(e.target.value)}
            placeholder="Keyword Search"
          />
          </form>
        </span>
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
  }, [currentPage, rowsPerPage]);

  const fetchDepartments = async (query) => {
    setIsLoading(true);

    let departmentData = {}
    if (query) {
      departmentData = await getDepartment(currentPage, rowsPerPage, query)
    }
    else {
      departmentData = await getDepartment(currentPage, rowsPerPage)
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

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="mb-3">
            <h2 className="mb-5 mt-2">Department List</h2>
          </div>
          <div className="card">
            <DataTable
              totalRecords={totalRecords}
              lazy
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
                  options={[5, 10, 25, 50]}
                  onChange={(e) => setRowsPerPage(e.value)}
                />
              }
            >
              <Column
                field="name"
                header="Name"
                filterField="name"
                filterMenuStyle={{ width: '14rem' }}
                style={{ minWidth: '12rem' }}
              />
              <Column
                field="action"
                header="Action"
                body={actionTemplate}
                style={{ textAlign: 'center', width: '8rem' }}
              />
            </DataTable>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DepartmentList;
