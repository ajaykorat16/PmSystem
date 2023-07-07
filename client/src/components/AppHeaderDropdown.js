import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../assets/images/avatars/8.jpg'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { useState, useEffect } from 'react'
import { CImage } from '@coreui/react'


const AppHeaderDropdown = () => {
  const [photo, setPhoto] = useState("");
  const { logout, auth } = useAuth()
  const { getUserProfile } = useUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    try {
      logout()
      navigate('/login')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        let { getProfile } = await getUserProfile(auth?.user._id);
        console.log("getprofile", getProfile)
        setPhoto(getProfile.photo)
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchData();
  }, [auth?.user._id]);

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CImage align="start" rounded src={photo} width={30} height={30} />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} >
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
