import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";
import toast from "react-hot-toast";

const DepartmentContext = createContext();

const DepartmentProvider = ({ children }) => {
  const { auth } = useAuth();

  const headers = {
    Authorization: auth?.token,
  };

  //getDepartments
  const getDepartment = async (page, limit, query, sortField, sortOrder) => {
    try {
      let queryUrl = ''

      if (query) {
        queryUrl = `&query=${query}`
      }

      const { data } = await axios.get(`${baseURL}/department?page=${page}&limit=${limit}${queryUrl}&sortField=${sortField}&sortOrder=${sortOrder}`, { headers });
      if (data.error === false) {
        return data
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDepartmentList = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/department/departmentlist`, { headers });
      if (data.error === false) {
        return data
      }
    } catch (error) {
      console.log(error);
    }
  };

  //add department
  const addDepartment = async (name) => {
    try {
      const { data } = await axios.post(`${baseURL}/department/createDepartment`, { name }, { headers });
      if (data.error === false) {
        getDepartment()
        setTimeout(function () {
          toast.success(data.message)
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          errors.forEach((error) => {
            toast.error(error.msg);
          });
        } else {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
        }
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  //delete department
  const deleteDepartment = async (id) => {
    try {
      const { data } = await axios.delete(`${baseURL}/department/deleteDepartment/${id}`, { headers })
      if (data.error === false) {
        getDepartment()
        toast.success(data.message)
      }
    } catch (error) {
      console.log(error);
    }
  }

  //update department
  const updateDepartment = async (name, id) => {
    try {
      const { data } = await axios.put(`${baseURL}/department/updateDepartment/${id}`, { name }, { headers })
      if (data.error === false) {
        getDepartment()
        setTimeout(function () {
          toast.success(data.message)
        }, 1000);

      }
    } catch (error) {
      console.log(error);
    }
  }

  //getSingleDepartment
  const getSingleDepartment = async (id) => {
    try {
      const { data } = await axios.get(`${baseURL}/department/getSingleDepartment/${id}`, { headers })
      return data.getSingle
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <DepartmentContext.Provider value={{ getDepartment, addDepartment, deleteDepartment, updateDepartment, getDepartmentList, getSingleDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
};

//custom hook
const useDepartment = () => useContext(DepartmentContext);

export { useDepartment, DepartmentProvider };
