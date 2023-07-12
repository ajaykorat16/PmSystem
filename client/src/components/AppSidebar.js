import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

import { useAuth } from '../context/AuthContext'
// sidebar nav config
import adminNavigatiion from './AdminNav'
import userNavigation from './UserNav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const {auth} = useAuth()
  const [role, setRole] = useState("")

  useEffect(()=>{
    if(auth?.user?.role){
      setRole(auth?.user?.role)
    }  
  }, [auth])
  
  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarBrand className="d-none d-md-flex" to="/">
        PM SYSTEM
      </CSidebarBrand>
      <CSidebarNav>
        <SimpleBar>
          {role && role === "admin" && <AppSidebarNav items={adminNavigatiion} />}
          {role && role === "user" && <AppSidebarNav items={userNavigation} />}
          {role=="" && <AppSidebarNav items={userNavigation} />}
        </SimpleBar>
      </CSidebarNav>
      <CSidebarToggler
        className="d-none d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
