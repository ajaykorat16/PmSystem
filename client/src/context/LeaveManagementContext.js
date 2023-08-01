import { useContext, createContext, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const LeaveManagementContext = createContext();

const LeaveManagementProvider = ({ children }) => {
  const { auth } = useAuth();
  const [leave, setLeave] = useState([]);
  const headers = {
    Authorization: auth?.token,
  };

  //get leave
  const getLeavesMonthWise = async (page, limit, query) => {
    try {
      let res;
      if (query) {
        res = await axios.post(
          `/leaveManagement/search?page=${page}&limit=${limit}`,
          { filter: query },
          { headers }
        );
      } else {
        res = await axios.get(
          `/leaveManagement`,
          {
            params: {
              page: page,
              limit: limit,
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

  //get single leave
  const getSingleLeave = async (id) => {
    try {
      const { data } = await axios.get(`/leaveManagement/singleLeave/${id}`, { headers })
      // console.log(data);
      return data.getLeave
    } catch (error) {
      console.log(error);
    }
  }

  //update leave
  const updateLeave = async (leave, id) => {
    try {
      const { data } = await axios.put(`/leaveManagement/updateLeave/${id}`, { leave }, { headers })

      if (data.error === false) {
        getLeavesMonthWise()
        setTimeout(function () {
          toast.success("Leave updated successfully")
        }, 1000);

      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <LeaveManagementContext.Provider
      value={{
        leave,
        getLeavesMonthWise,
        getSingleLeave,
        updateLeave
      }}
    >
      {children}
    </LeaveManagementContext.Provider>
  );
};

//custom hook
const useLeaveManagement = () => useContext(LeaveManagementContext);

export { useLeaveManagement, LeaveManagementProvider };
