import React, { useEffect, useState } from "react";
import { CForm, CCol, CFormInput, CFormSelect, CButton, CFormCheck } from "@coreui/react";
import { useLeave } from "../context/LeaveContext";
import { useUser } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Layout from "./Layout";
import toast from "react-hot-toast";
import { Calendar } from "primereact/calendar";
import { useHelper } from "../context/Helper";

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
  const { formatDate } = useHelper()
  const typeList = ["paid", "lwp"];
  const dayTypeList = ["Single Day", "Multiple Day", "First Half", "Second Half"];
  const navigate = useNavigate();
  const { id } = useParams();

  function mapDayType(dayType) {
    switch (dayType) {
      case "Single Day":
        return "single";
      case "Multiple Day":
        return "multiple";
      case "First Half":
        return "first_half";
      case "Second Half":
        return "second_half";
      default:
        return dayType;
    }
  }

  useEffect(() => {
    const setValues = async () => {
      const data = await getLeaveById(id);
      if (data) {
        setUserId(data.userId ? data.userId._id : "");
        setReason(data.reason);
        setStatus(data.status);
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
      const leaveData = {
        reason,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        leaveType,
        leaveDayType: mapDayType(leaveDayType),
        userId,
        status,
        totalDays,
      };
      const data = await updateLeave(leaveData, id);
      if (data.error) {
        toast.error(data.message);
      } else {
        navigate("/dashboard/leave/list");
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
    getUsers();
  }, []);

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
    }else{
      handleHalfDay()
    }
  }, [startDate, endDate]);

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
    <Layout title={title}>
      {isLoading === true && <Loader />}
      {isLoading === false && (
        <>
          <div className="mb-3">
            <h2 className="mb-5 mt-2">Update Leave</h2>
          </div>
          <CForm className="row g-3 mb-3" onSubmit={handleSubmit}>
            <CCol md={6}>
              <CFormSelect
                id="inputUserName"
                label="User Name"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {users.map((u) => (
                  <option
                    key={u._id}
                    value={u._id}
                  >{`${u.firstname} ${u.lastname}`}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormInput
                id="inputReason"
                label="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                id="inputStatus"
                label="Status"
                value={status}
                disabled
              />
            </CCol>
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
                maxDate={endDate}
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
              <CButton className="me-md-2" onClick={() => navigate('/dashboard/leave/list')}>
                Back
              </CButton>
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
