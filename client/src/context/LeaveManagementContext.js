import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";

const LeaveManagementContext = createContext();

const LeaveManagementProvider = ({ children }) => {
  const { auth, toast } = useAuth();

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
          toast.current.show({ severity: 'success', summary: 'Leave Manage', detail: data.message, life: 3000 })
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
          toast.current.show({ severity: 'success', summary: 'Leave Manage', detail: data.message, life: 3000 })
        }, 1000);
        return data;
      } else {
        toast.current.show({ severity: 'info', summary: 'Leave Manage', detail: data.message, life: 3000 })
      }
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          if (errors.length > 1) {
            toast.current.show({ severity: 'error', summary: 'Leave Manage', detail: "Please fill all fields.", life: 3000 })
          } else {
            toast.current.show({ severity: 'error', summary: 'Leave Manage', detail: errors[0].msg, life: 3000 })
          }
        }
      } else {
        toast.current.show({ severity: 'error', summary: 'Leave Manage', detail: 'An error occurred. Please try again later.', life: 3000 })
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
