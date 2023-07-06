import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import Login from '../../pages/Login'


const AdminRoutes = () => {
    const [ok,setOk]=useState(false)
    const {auth}=useAuth()

    useEffect(() => {
      
        const authCheck=async()=>{
            const res=await axios.get(`/user/admin-auth`)

            if(res.data.ok){
                setOk(true)
            }
            else{
                setOk(false)
            }

        }
        
        if(auth?.token) authCheck()

    }, [auth?.token])

    return ok? <Outlet/>:<Login/>
    
 
}

export default AdminRoutes
