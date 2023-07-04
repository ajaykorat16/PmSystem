import React from 'react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'


const DefaultLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <h1>hello</h1>
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout
