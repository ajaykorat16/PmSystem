import { useState, useContext, createContext, useEffect } from "react";
import axios from 'axios'
import { useAuth } from "./AuthContext";

const DepartmentContext = createContext()

const DepartmentProvider = ({ children }) => {
    const [department, setDepartment] = useState([])
    const { auth } = useAuth()
    const headers = {
        Authorization: auth?.token
    };
    useEffect(() => {
        const getDepartment = async () => {
            try {
                const res = await axios.get(`/department`,{headers})
                if (res.data.error === false) {
                    setDepartment(res.data.getAllDepartments)
                }
            } catch (error) {
                console.log(error);
            }
        };
        getDepartment()
    }, [auth?.token])
    

    return (
        <DepartmentContext.Provider value={{ department }}>
            {children}
        </DepartmentContext.Provider>
    )

}

//custom hook 
const useDepartment = () => useContext(DepartmentContext)

export { useDepartment, DepartmentProvider }