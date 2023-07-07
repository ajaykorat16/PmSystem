import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

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
      await axios.post("/department/createDepartment", { name }, { headers });
      getDepartment()
    } catch (error) {
      console.log(error);
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
