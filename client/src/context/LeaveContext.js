import { useState, useContext, createContext, useEffect } from "react";
import axios from 'axios'
import { useAuth } from "./AuthContext";

const LeaveContext = createContext()

const LeaveProvider = ({ children }) => {
    const [leave, setLeave] = useState([])
    const { auth } = useAuth()
    const headers = {
        Authorization: auth?.token
    };

    const addLeave=async(leaveData)=>{
        try {
            const {userId,reason,endDate,type,status}=leaveData

            const res = await axios.get(`/leaves/createLeaveAdmin`,{userId,reason,endDate,type,status},{headers})

        } catch (error) {
            
        }
    }

   
    useEffect(() => {
        const getLeave = async () => {
            try {
                const res = await axios.get(`/leaves`,{headers})
    
                if (res.data.error === false) {
                    setLeave(res.data.leaves)
                }
    
            } catch (error) {
    
            }
        };
        getLeave()
    }, [auth?.token])
    

    return (
        <LeaveContext.Provider value={{ leave }}>
            {children}
        </LeaveContext.Provider>
    )

}

//custom hook 
const useLeave = () => useContext(LeaveContext)

export { useLeave, LeaveProvider }