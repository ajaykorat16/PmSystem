import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const LeaveContext = createContext();

const LeaveProvider = ({ children }) => {
  const [leave, setLeave] = useState([]);
  const [userLeaves, setUserLeaves] = useState([]);
  const { auth } = useAuth();
  const headers = {
    Authorization: auth?.token,
  };

  //get leave
  const getLeave = async (page, limit, query, sortField, sortOrder) => {
    try {
      let res;
      if (query) {
        res = await axios.post(
          `/leaves/leavelist-search?page=${page}&limit=${limit}`,
          { filter: query },
          { headers }
        );
      } else {
        res = await axios.get(
          `/leaves/leavelist`,
          {
            params: {
              page: page,
              limit: limit,
              sortField: sortField,
              sortOrder: sortOrder,
            },
          },
          { headers }
        );
      }
      if (res.data.error === false) {
        setLeave(res.data.leaves);
        return res.data;
      }
    } catch (error) {
      console.log(error);
    }
  };
  // useEffect(() => {
  //   getLeave();
  // }, [auth?.token]);

  //add leave
  const addLeave = async (leaveData) => {
    try {
      const { reason, startDate, endDate, type, userId, status } = leaveData;

      const { data } = await axios.post(
        `/leaves/createLeaveAdmin`,
        { reason, startDate, endDate, type, userId, status },
        { headers }
      );

      if (data.error === false) {
        getLeave();
        setTimeout(function () {
          toast.success("Leave created successfully");
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          toast.error("Please fill all fields");
        } else {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
        }
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  //delete leave
  const deleteLeave = async (id) => {
    try {
      const res = await axios.delete(`/leaves/deleteLeave/${id}`, { headers });

      if (res.data.error === false) {
        getLeave();
        toast.success("Leave deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //update leave
  const updateLeave = async (leaveData, id) => {
    try {
      const { reason, startDate, endDate, type, userId, status } = leaveData;

      const { data } = await axios.put(
        `/leaves/updateLeave/${id}`,
        { reason, startDate, endDate, type, userId, status },
        { headers }
      );

      if (data.error === false) {
        getLeave();
        setTimeout(function () {
          toast.success("Leave updated successfully");
        }, 1000);
      }
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
      const { data } = await axios.get(`/leaves/userLeaves`, { headers });
      if (data.error === false) {
        setUserLeaves(data.leaves);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUserLeave();
  }, [auth?.token]);

  //add user leave
  const addUserLeave = async (leaveData) => {
    try {
      const { reason, startDate, endDate, type, status } = leaveData;

      const { data } = await axios.post(
        `/leaves/createLeave`,
        { reason, startDate, endDate, type, status },
        { headers }
      );

      if (data.error === false) {
        getUserLeave();
        setTimeout(function () {
          toast.success("Leave created successfully");
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          toast.error("Please fill all fields");
          // errors.forEach((error) => {
          //     toast.error(error.msg);
          // });
        } else {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
        }
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <LeaveContext.Provider
      value={{
        getLeave,
        leave,
        addLeave,
        deleteLeave,
        updateLeave,
        getLeaveById,
        userLeaves,
        addUserLeave,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

//custom hook
const useLeave = () => useContext(LeaveContext);

export { useLeave, LeaveProvider };
