import React, { useEffect, useState } from "react";
import { CForm, CCol, CFormInput, CFormSelect, CButton } from "@coreui/react";
import { useLeave } from "../context/LeaveContext";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { useHelper } from "../context/Helper";
import Loader from "../components/Loader";
import Layout from "./Layout";

const LeaveUpdate = ({ title }) => {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveDayType, setLeaveDayType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { updateLeave, getLeaveById } = useLeave();
  const { fetchUsers } = useUser();
  const { auth, toast } = useAuth();
  const { formatDate } = useHelper()
  const { id } = useParams();
  const typeList = ["paid", "lwp"];
  const dayTypeList = ["Single Day", "Multiple Day", "First Half", "Second Half"];
  const navigate = useNavigate();

  useEffect(() => {
    const setValues = async () => {
      const data = await getLeaveById(id);
      if (data) {
        setUserId(data.userId ? data.userId : "");
        setReason(data.reason);
        setStatus(data.leaveStatus);
        setStartDate(new Date(data.startDate));
        setEndDate(new Date(data.endDate));
        setTotalDays(data.totalDays);
        setLeaveType(data.leaveType);
        setLeaveDayType(data.leaveDayType);
        setIsLoading(false);
      }
    };
    setValues();
  }, [getLeaveById, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let leaveData
      if (auth.user.role === "admin") {
        leaveData = { reason, startDate: formatDate(startDate), endDate: formatDate(endDate), leaveType, leaveDayType, userId, status, totalDays, };
      } else {
        leaveData = { reason, startDate: formatDate(startDate), endDate: formatDate(endDate), leaveType, leaveDayType, totalDays }
      }
      
      const data = await updateLeave(leaveData, id);
      if (typeof data !== 'undefined' && data.error === false) {
        const redirectPath = auth.user.role === "admin" ? "/dashboard/leave/list" : "/dashboard-user/leave/list";
        navigate(redirectPath);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    const { data } = await fetchUsers();
    setUsers(data);
  };

  useEffect(() => {
    if (auth.user.role === "admin") {
      getUsers();
    }
  }, [auth.user.role]);

  const leaveDaysCount = (startDate, endDate) => {
    const eDate = new Date(endDate);
    let currentDate = new Date(startDate);
    let totalDays = 0;
    while (currentDate <= eDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setTotalDays(totalDays);
  };

  useEffect(() => {
    if (leaveDayType === "Multiple Day") {
      leaveDaysCount(startDate, endDate);
    } else {
      handleHalfDay()
    }
  }, [startDate, endDate, leaveDayType]);

  const handleHalfDay = () => {
    let currentDate = new Date(startDate);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (leaveDayType === "First Half" || leaveDayType === "Second Half") {
        setEndDate(startDate);
        setTotalDays(0.5);
      }
      if (leaveDayType === "Single Day") {
        setEndDate(startDate);
        setTotalDays(1);
      }
    }
  };

  return (
    <Layout title={title} toast={toast}>
      {isLoading === true && <Loader />}
      {isLoading === false && (
        <>
          <div className="mb-3">
            <h2 className="mb-5 mt-2">Update Leave</h2>
          </div>
          <CForm className="row g-3 mb-3" onSubmit={handleSubmit}>
            {auth.user.role === "admin" && (
              <CCol md={6}>
                <CFormSelect
                  id="inputUserName"
                  label="User Name"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                >
                  <option value="" disabled>
                    Select User
                  </option>
                  {users.map((u) => (
                    <option
                      key={u.id}
                      value={u.id}
                    >{`${u.firstname} ${u.lastname}`}</option>
                  ))}
                </CFormSelect>
              </CCol>
            )}
            <CCol md={6}>
              <CFormInput
                id="inputReason"
                label="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </CCol>
            {auth.user.role === "admin" && (
              <CCol md={6}>
                <CFormInput
                  id="inputStatus"
                  label="Status"
                  placeholder="Pending"
                  disabled
                />
              </CCol>
            )}
            <CCol md={6}>
              <CFormSelect
                id="inputType"
                label="Leave Type"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="" disabled>
                  Select a Leave Type
                </option>
                {typeList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                id="inputType"
                label="Leave Day Type"
                value={leaveDayType}
                onChange={(e) => setLeaveDayType(e.target.value)}
              >
                {dayTypeList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={6}>
              <CFormInput
                id="inputendDate"
                label="Total Days"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                disabled
              />
            </CCol>
            <CCol xs={6}>
              <label className="form-label">Leave Start</label>
              <Calendar
                value={startDate}
                dateFormat="dd-mm-yy"
                onChange={(e) => setStartDate(e.target.value)}
                showIcon
                id="date"
                className="form-control"
              />
            </CCol>
            <CCol xs={6}>
              <label className="form-label">Leave End</label>
              <Calendar
                value={endDate}
                dateFormat="dd-mm-yy"
                minDate={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={leaveDayType !== "Multiple Day"}
                showIcon
                id="date"
                className="form-control"
              />
            </CCol>
            <CCol xs={12}>
              <CButton type="submit" className="me-md-2">
                Submit
              </CButton>
            </CCol>
          </CForm>
        </>
      )}
    </Layout>
  );
};

export default LeaveUpdate;
