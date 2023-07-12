import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const LeaveContext = createContext();

const LeaveProvider = ({ children }) => {
  const [leave, setLeave] = useState([]);
  const [userLeaves, setUserLeaves] = useState([])
  const { auth } = useAuth();
  const headers = {
    Authorization: auth?.token,
  };

  //get leave
  const getLeave = async () => {
    try {
      const res = await axios.get(`/leaves`, { headers });
      if (res.data.error === false) {
        setLeave(res.data.leaves);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getLeave();
  }, [auth?.token]);

  //add leave
  const addLeave = async (leaveData) => {
    try {
      const { reason, startDate, endDate, type, userId, status } = leaveData;

      await axios.post(
        `/leaves/createLeaveAdmin`,
        { reason, startDate, endDate, type, userId, status },
        { headers }
      );
      getLeave();
    } catch (error) {
      console.log(error);
    }
  };

  //delete leave
  const deleteLeave = async (id) => {
    try {
      const res = await axios.delete(`/leaves/deleteLeave/${id}`, { headers });
      getLeave();
    } catch (error) {
      console.log(error);
    }
  };

  //update leave
  const updateLeave = async (leaveData, id) => {
    try {
      const { reason, startDate, endDate, type, userId, status } = leaveData;

      await axios.put(
        `/leaves/updateLeave/${id}`,
        { reason, startDate, endDate, type, userId, status },
        { headers }
      );
      getLeave();
    } catch (error) {
      console.log(error);
    }
  };

  //get single leave
  const getLeaveById = async (id) => {
    try {
      const { data } = await axios.get(`/leaves/getLeaveById/${id}`, {
        headers,
      });
      return data.leaves;
    } catch (error) {
      console.log(error);
    }
  };

  //get user leave
  const getUserLeave = async () => {
    try {
      const {data} = await axios.get(`/leaves/userLeaves`,{headers})
      if(data.error === false) {
        setUserLeaves(data.leaves)
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(()=>{
    getUserLeave()
  }, [auth?.token])

  //add user leave
  const addUserLeave = async (leaveData) => {
    try {
      const { reason, startDate, endDate, type, status } = leaveData;

      await axios.post(
        `/leaves/createLeave`,
        { reason, startDate, endDate, type, status },
        { headers }
      );
      getUserLeave()
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <LeaveContext.Provider
      value={{ leave, addLeave, deleteLeave, updateLeave, getLeaveById, userLeaves, addUserLeave }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

//custom hook
const useLeave = () => useContext(LeaveContext);

export { useLeave, LeaveProvider };
