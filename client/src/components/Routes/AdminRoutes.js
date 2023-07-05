import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Spinner from '../Spinner'
import { useAuth } from '../../context/AuthContext'


const AdminRoutes = () => {
    const [ok,setOk]=useState(false)
    const {auth}=useAuth()
    const navigate=useNavigate()

    useEffect(() => {
      
        const authCheck=async()=>{
            const res=await axios.get(`/user/admin-auth`)
            console.log(res)

            if(res.data.ok){
                setOk(true)
            }
            else{
                setOk(false)
            }

        }
        if(auth?.token) {
            console.log("here",auth.token)
            
            authCheck()
        }

    }, [auth?.token])

    return ok? <Outlet/>:navigate('/login')
    
 
}

export default AdminRoutes
