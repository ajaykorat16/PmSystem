import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";
import toast from "react-hot-toast";

const LeaveContext = createContext();

const LeaveProvider = ({ children }) => {
  const { auth } = useAuth();

  const headers = {
    Authorization: auth?.token,
  };

  //get leave
  const getLeave = async (page, limit, query, sortField, sortOrder) => {
    try {
      let res;
      if (query) {
        res = await axios.post(`${baseURL}/leaves/leavelist-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
      } else {
        res = await axios.get(`${baseURL}/leaves/leavelist`, { params: { page, limit, sortField, sortOrder } }, { headers });
      }
      if (res.data.error === false) {
        return res.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  //add leave
  const addLeave = async (leaveData) => {
    try {
      const { data } = await axios.post(`${baseURL}/leaves/createLeaveAdmin`, leaveData, { headers });

      if (data.error === false) {
        getLeave();
        setTimeout(function () {
          toast.success(data.message);
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          if (errors.length > 1) {
            toast.error("Please fill all fields")
          } else {
            toast.error(errors[0].msg)
          }
        } else {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
        }
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  //delete leave
  const deleteLeave = async (id) => {
    try {
      const { data } = await axios.delete(`${baseURL}/leaves/deleteLeave/${id}`, { headers });
      if (data.error === false) {
        getLeave();
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //update leave
  const updateLeave = async (leaveData, id) => {
    try {
      const { data } = await axios.put(`${baseURL}/leaves/updateLeave/${id}`, leaveData, { headers });

      if (data.error === false) {
        getLeave();
        setTimeout(function () {
          toast.success(data.message);
        }, 1000);
      }
      return data
    } catch (error) {
      console.log(error);
    }
  };

  //update status
  const updateStatus = async (status, id, reasonForLeaveReject) => {
    try {
      const { data } = await axios.put(`${baseURL}/leaves/updateStatus/${id}`, { status, reasonForLeaveReject }, { headers })
      if (data.error === false) {
        getLeave()
      }
    } catch (error) {
      console.log(error);
    }
  }

  //get single leave
  const getLeaveById = async (id) => {
    try {
      const { data } = await axios.get(`${baseURL}/leaves/getLeaveById/${id}`, { headers });
      return data.leaves;
    } catch (error) {
      console.log(error);
    }
  };

  //get user leave
  const getUserLeave = async (page, limit, query, sortField, sortOrder) => {
    try {
      let res;
      if (query) {
        res = await axios.post(`${baseURL}/leaves/userLeaves-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
      } else {
        res = await axios.get(`${baseURL}/leaves/userLeaves`, { params: { page, limit, sortField, sortOrder } }, { headers });
      }
      if (res.data.error === false) {
        return res.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  //add user leave
  const addUserLeave = async (leaveData) => {
    try {
      const { data } = await axios.post(`${baseURL}/leaves/createLeave`, leaveData, { headers });
      if (data.error === false) {
        getUserLeave();
        setTimeout(function () {
          toast.success(data.message);
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          if (errors.length > 1) {
            toast.error("Please fill all fields")
          } else {
            toast.error(errors[0].msg)
          }
        } else {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
        }
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <LeaveContext.Provider value={{ getLeave, addLeave, deleteLeave, updateLeave, getLeaveById, addUserLeave, getUserLeave, updateStatus, }}>
      {children}
    </LeaveContext.Provider>
  );
};

//custom hook
const useLeave = () => useContext(LeaveContext);

export { useLeave, LeaveProvider };
