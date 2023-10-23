import React, { useEffect, useState } from "react";
import { CForm, CCol, CFormInput, CFormSelect, CButton } from "@coreui/react";
import { useLeave } from "../context/LeaveContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar } from "primereact/calendar";
import { useHelper } from "../context/Helper";
import Layout from "./Layout";

const LeaveCreate = ({ title }) => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(1)
  const [leaveType, setLeaveType] = useState("");
  const [leaveDayType, setLeaveDayType] = useState("Single Day");
  const { formatDate } = useHelper()
  const { auth, toast } = useAuth();
  const { addLeave, addUserLeave } = useLeave();
  const { fetchUsers } = useUser();
  const typeList = ["paid", "lwp"];
  const dayTypeList = ["Single Day", "Multiple Day", "First Half", "Second Half"];
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let leaveData;
      if (auth.user.role === "admin") {
        leaveData = { reason, startDate: formatDate(startDate), endDate: formatDate(endDate), leaveType, leaveDayType, totalDays, userId, status: "approved" }
      } else {
        leaveData = { reason, startDate: formatDate(startDate), endDate: formatDate(endDate), leaveType, leaveDayType, totalDays }
      }
      
      const data = auth.user.role === "admin" ? await addLeave(leaveData) : await addUserLeave(leaveData);
      if (typeof data !== 'undefined' && data.error === false) {
        const redirectPath = auth.user.role === "admin" ? "/dashboard/leave/list" : "/dashboard-user/leave/list";
        navigate(redirectPath);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    const { getAllUsers } = await fetchUsers();
    setUsers(getAllUsers);
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
      <div className="mb-3">
        <h2 className="mb-5 mt-2">Create Leave</h2>
      </div>
      <CForm className="row g-3" onSubmit={handleSubmit}>
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
                  key={u._id}
                  value={u._id}
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
              placeholder="Approved"
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
            minDate={startDate}
            dateFormat="dd-mm-yy"
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
    </Layout>
  );
};

export default LeaveCreate;
