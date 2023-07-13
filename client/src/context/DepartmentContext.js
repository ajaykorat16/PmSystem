import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const DepartmentContext = createContext();

const DepartmentProvider = ({ children }) => {
  const [department, setDepartment] = useState([]);
  const { auth } = useAuth();
  const headers = {
    Authorization: auth?.token,
  };

  //getDepartments
  const getDepartment = async () => {
    try {
      const res = await axios.get(`/department`, { headers });
      if (res.data.error === false) {
        setDepartment(res.data.getAllDepartments);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getDepartment();
  }, [auth?.token]);

  //add department
  const addDepartment = async (name) => {
    try {
      const {data} = await axios.post("/department/createDepartment", { name }, { headers });
      getDepartment()
      return data;
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors;
        if (errors && Array.isArray(errors) && errors.length > 0) {
            // toast.error("Please fill all fields")
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
      const res = await axios.delete(`/department/deleteDepartment/${id}`, {headers})
      getDepartment()
    } catch (error) {
      console.log(error);
    }
  }

  //update department
  const updateDepartment = async (name,id) => {
    try {
      await axios.put(`/department/updateDepartment/${id}`, {name}, {headers})
      getDepartment()
    } catch (error) {
      console.log(error);
    }
  }

  //getSingleDepartment
  const getSingleDepartment = async (id) => {
    try {
      const {data} = await axios.get(`/department/getSingleDepartment/${id}`, {headers})
      return data.getSingle
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <DepartmentContext.Provider value={{ department, addDepartment, deleteDepartment, updateDepartment, getSingleDepartment}}>
      {children}
    </DepartmentContext.Provider>
  );
};

//custom hook
const useDepartment = () => useContext(DepartmentContext);

export { useDepartment, DepartmentProvider };
