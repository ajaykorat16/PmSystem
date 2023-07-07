import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../Spinner'


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

    return ok? <Outlet/>:<Spinner/>
    
 
}

export default AdminRoutes
