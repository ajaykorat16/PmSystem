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
  const getDepartment = async (page,limit,query) => {
    try {
      let queryUrl=''
      console.log("query",query)

      if(query){
        queryUrl=`&query=${query}`
      }

      const res = await axios.get(`/department?page=${page}&limit=${limit}${queryUrl}`, { headers });
      if (res.data.error === false) {
        setDepartment(res.data.getAllDepartments);
        return res.data
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

      if(data.error===false){
        getDepartment()
        setTimeout(function(){
          toast.success("Department created successfully")
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
      const res = await axios.delete(`/department/deleteDepartment/${id}`, {headers})

      if(res.data.error===false){
        getDepartment()
        toast.success("Department deleted successfully")
      }
    } catch (error) {
      console.log(error);
    }
  }

  //update department
  const updateDepartment = async (name,id) => {
    try {
      const {data} = await axios.put(`/department/updateDepartment/${id}`, {name}, {headers})
      
      if(data.error===false){
        getDepartment()
        setTimeout(function(){
          toast.success("Department updated successfully")
        }, 1000);

      }
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
    <DepartmentContext.Provider value={{ department, getDepartment, addDepartment, deleteDepartment, updateDepartment, getSingleDepartment}}>
      {children}
    </DepartmentContext.Provider>
  );
};

//custom hook
const useDepartment = () => useContext(DepartmentContext);

export { useDepartment, DepartmentProvider };
