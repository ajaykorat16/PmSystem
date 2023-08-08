import React, { useEffect, useState } from "react";
import { CForm, CCol, CFormInput, CFormSelect, CButton, CFormCheck } from "@coreui/react";
import { useLeave } from "../context/LeaveContext";
import { useUser } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Layout from "./Layout";
import toast from "react-hot-toast";

const LeaveUpdate = ({ title }) => {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { updateLeave, getLeaveById } = useLeave();
  const { fetchUsers } = useUser();
  const typeList = ["paid", "lwp"];
  const [isHalfDay, setIsHalfDay] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const setValues = async () => {
      const data = await getLeaveById(id);
      if (data) {
        setUserId(data.userId ? data.userId._id : "");
        setReason(data.reason);
        setStatus(data.status);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setTotalDays(data.totalDays);
        setType(data.type);
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
        startDate,
        endDate,
        type,
        userId,
        status,
        totalDays,
      };
      await updateLeave(leaveData, id);
      navigate("/dashboard/leave/list");
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
    if (!isHalfDay) {
      leaveDaysCount(startDate, endDate);
    }
  }, [startDate, endDate]);

  const handleIsHalfDayChange = (e) => {
    setIsHalfDay(e.target.checked);
    let currentDate = new Date(startDate);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (e.target.checked) {
        setEndDate(startDate);
        setTotalDays(0.5);
      }
    }else{
      toast.error("You can't take a leave on Saturday and Sunday")
      setEndDate(startDate);
      setTotalDays(0)
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
          <CForm className="row g-3" onSubmit={handleSubmit}>
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
              // onChange={(e) => setStatus(e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                id="inputType"
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {typeList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={6}>
              <CFormInput
                type="date"
                id="inputstartDate"
                label="Leave Start"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </CCol>
            <CCol xs={6}>
              <CFormCheck
                className="mt-4"
                type="checkbox"
                id="inputIsHalfDay"
                label="Half Day"
                checked={isHalfDay}
                onChange={handleIsHalfDayChange}
              />
            </CCol>
            <CCol xs={6}>
              <CFormInput
                type="date"
                id="inputendDate"
                label="Leave End"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isHalfDay}
              />
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
