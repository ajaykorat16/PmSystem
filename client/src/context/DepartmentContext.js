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
  // const deleteDepartment = async (_id) => {
  //     try {
  //         await axios.delete(`/department/deleteDepartment/${_id}`, {headers})
  //     } catch (error) {
  //         console.log(error);
  //     }
  // }
  return (
    <DepartmentContext.Provider value={{ department, addDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
};

//custom hook
const useDepartment = () => useContext(DepartmentContext);

export { useDepartment, DepartmentProvider };
