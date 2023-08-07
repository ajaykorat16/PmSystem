import React from 'react'
import Layout from './Layout'
import { useAuth } from '../context/AuthContext'

const DefaultLayout = () => {
  const {auth} = useAuth()
  return (
    <Layout>
      <h1>Welcome {auth?.user?.fullName}</h1>
    </Layout>
  )
}

export default DefaultLayout
