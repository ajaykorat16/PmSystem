import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import {Toaster} from "react-hot-toast"

const Layout = ({children}) => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <Toaster/>
        <div className="body flex-grow-1 px-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
