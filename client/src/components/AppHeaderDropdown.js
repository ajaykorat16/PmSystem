import React, { useState, useEffect } from 'react';
import { CImage, CAvatar, CDropdown, CDropdownDivider, CDropdownHeader, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const AppHeaderDropdown = () => {
  const [photo, setPhoto] = useState('');
  const { logout, auth } = useAuth();
  const { getUserProfile } = useUser();
  const [getAuth, setGetAuth] = useState(null);
  const [isPhoto, setIsPhoto] = useState(false)
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleLogin = () => {
    try {
      navigate('/login');
    } catch (error) {
      console.log(error);
    }
  }

  const fetchData = async () => {
    try {
      if (getAuth && getAuth.user) {
        const { getProfile } = await getUserProfile(auth.user._id);
        setPhoto(getProfile.photo);
        setIsPhoto(true)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    let authdata = JSON.parse(localStorage.getItem('auth'));
    setGetAuth(authdata);
  }, []);

  useEffect(() => {
    if (getAuth && getAuth.user) {
      fetchData();
    }
  }, [getAuth]);
  
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        {isPhoto &&
          <CImage align="start" rounded src={photo} width={30} height={30} alt="User Avatar" />
        }
        {isPhoto === false &&
          <CAvatar color="success" textColor="white" shape="rounded">
            PM
          </CAvatar>
        }

      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
        {getAuth && 
          <>
            <CDropdownItem onClick={()=>navigate(`/dashboard/user/user-profile/${getAuth?.user._id}`)}>
              <CIcon icon={cilUser} className="me-2" />
              Profile
            </CDropdownItem>
            <CDropdownDivider />
          </>
        }
        {getAuth ?
          <CDropdownItem onClick={handleLogout}>
            <CIcon icon={cilLockLocked} className="me-2" />
            Logout
          </CDropdownItem> :
          <CDropdownItem onClick={handleLogin}>
            <CIcon icon={cilLockLocked} className="me-2" />
            Login
          </CDropdownItem>
        } 
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
