import React, { useEffect, useState } from 'react'
import { useLeave } from '../../context/LeaveContext';
import Loader from '../../components/Loader'
import moment from 'moment';
import { AiTwotoneDelete, AiTwotoneEdit } from 'react-icons/ai';
import Layout from '.././Layout';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";


const LeaveList = () => {
    const { getUserLeave } = useLeave()
    const [isLoading, setIsLoading] = useState(true)
    const [userleaveList, setUserLeaveList] = useState([]);

    const fetchLeaves = async () => {
        setIsLoading(true);
        let leaveData = await getUserLeave();
        setUserLeaveList(leaveData.leaves);
        setIsLoading(false);
    };
    useEffect(() => {
       fetchLeaves();
    }, []);

    const renderHeader = () => {
        return (
            <div>
              <h4>Leaves</h4>
          </div>
        );
    };
    const header = renderHeader();

    const start = (rowData) => {
        return <div>{moment(rowData.startDate).format("DD-MM-YYYY")}</div>;
    };
    const end = (rowData) => {
        return <div>{moment(rowData.endDate).format("DD-MM-YYYY")}</div>;
    };

    return (
        <Layout>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="card mb-5">
                <DataTable
                  lazy
                  value={userleaveList}
                  dataKey="_id"
                  header={header}
                  emptyMessage="No leave found."
                >
                  <Column field="index" header="#" filterField="index" />
                  <Column field="userId.fullName" header="Name" filterField="name" />
                  <Column
                    field="reason"
                    header="Reason"
                    filterField="reason"
                  />
                  <Column field="startDate" body={start} header="Start Date" filterField="start" />
                  <Column body={end} header="End Date" filterField="end" />
                  <Column field="type" header="Type" filterField="type" />
                  <Column field="status" header="Status" filterField="status" />
                </DataTable>
              </div>
            </>
          )}
        </Layout>
      );
}

export default LeaveList
