import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";

const DepartmentContext = createContext();

const DepartmentProvider = ({ children }) => {
  const { auth, toast } = useAuth();

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
          toast.current.show({ severity: 'success', summary: 'Department', detail: data.message, life: 3000 })
        }, 1000);
        return data;
      } else {
        toast.current.show({ severity: 'error', summary: 'Department', detail: data.message, life: 3000 })
      }
    } catch (error) {
      if (error.response.status === 400) {
        return toast.current.show({ severity: 'error', summary: 'Department', detail:  "Department Already Exists.", life: 3000 })
      }
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
          if (errors.length > 1) {
            toast.current.show({ severity: 'error', summary: 'Department', detail: "Please fill all fields.", life: 3000 })
          } else {
            toast.current.show({ severity: 'error', summary: 'Department', detail: errors[0].msg, life: 3000 })
          }
        }
      } else {
        toast.current.show({ severity: 'error', summary: 'Department', detail: 'An error occurred. Please try again later.', life: 3000 })
      }
    }
  };

  //delete department
  const deleteDepartment = async (id) => {
    try {
      const { data } = await axios.delete(`${baseURL}/department/deleteDepartment/${id}`, { headers })
      if (data.error === false) {
        getDepartment()
        toast.current.show({ severity: 'success', summary: 'Department', detail: data.message, life: 3000 })
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
          toast.current.show({ severity: 'success', summary: 'Department', detail: data.message, life: 3000 })
        }, 1000);
        return data;
      }
    } catch (error) {
      if (error.response.status === 400) {
        return toast.current.show({ severity: 'error', summary: 'Department', detail:  "Department Already Exists.", life: 3000 })
      }
      console.log(error);
    }
  }

  //getSingleDepartment
  const getSingleDepartment = async (id) => {
    try {
      const { data } = await axios.get(`${baseURL}/department/getSingleDepartment/${id}`, { headers })
      return data.data
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
