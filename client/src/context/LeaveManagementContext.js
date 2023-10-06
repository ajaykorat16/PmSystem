import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";
import toast from "react-hot-toast";

const LeaveManagementContext = createContext();

const LeaveManagementProvider = ({ children }) => {
  const { auth } = useAuth();

  const headers = {
    Authorization: auth?.token,
  };

  //get leave
  const getLeavesMonthWise = async (page, limit, query) => {
    try {
      let res;
      if (query) {
        res = await axios.post(`${baseURL}/leaveManagement/search?page=${page}&limit=${limit}`, { filter: query }, { headers });
      } else {
        res = await axios.get(`${baseURL}/leaveManagement`, { params: { page, limit } }, { headers });
      }
      if (res.data.error === false) {
        return res.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  //get single leave
  const getSingleLeave = async (id) => {
    try {
      const { data } = await axios.get(`${baseURL}/leaveManagement/singleLeave/${id}`, { headers })
      return data.getLeave
    } catch (error) {
      console.log(error);
    }
  }

  //update leave
  const updateLeave = async (leave, id) => {
    try {
      const { data } = await axios.put(`${baseURL}/leaveManagement/updateLeave/${id}`, { leave }, { headers })
      if (data.error === false) {
        getLeavesMonthWise()
        setTimeout(function () {
          toast.success(data.message)
        }, 1000);

      }
    } catch (error) {
      console.log(error);
    }
  }

  //get user leave
  const getUserLeave = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/leaveManagement/userLeaves`, { headers })
      if (data.error === false) {
        return data
      }
    } catch (error) {
      console.log(error);
    }
  }

  //create leave
  const createLeave = async (leave) => {
    try {
      const { data } = await axios.post(`${baseURL}/leaveManagement/create-manageLeave`, leave, { headers });
      if (data.error === false) {
        getLeavesMonthWise()
        setTimeout(function () {
          toast.success(data.message)
        }, 1000);
        return data;
      } else {
        toast.error(data.message)
      }
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
  }

  return (
    <LeaveManagementContext.Provider value={{ getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeave, createLeave }} >
      {children}
    </LeaveManagementContext.Provider>
  );
};

//custom hook
const useLeaveManagement = () => useContext(LeaveManagementContext);

export { useLeaveManagement, LeaveManagementProvider };
