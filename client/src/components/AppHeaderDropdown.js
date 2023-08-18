import React, { useState, useEffect } from 'react';
import { CImage, CDropdown, CDropdownDivider, CDropdownHeader, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { MdOutlineLockReset } from 'react-icons/md';
import { Avatar } from 'primereact/avatar';

const LeaveBalanceDisplay = ({ leaveBalance }) => {
  return (
    <div className='balance'>
      Leave Balance: {leaveBalance}
    </div>
  );
};

const AppHeaderDropdown = () => {
  const [photo, setPhoto] = useState('');
  const { logout, auth } = useAuth();
  const { getUserProfile } = useUser();
  const [getAuth, setGetAuth] = useState(null);
  const [isPhoto, setIsPhoto] = useState(false)
  const navigate = useNavigate();
  const [leaveBalance, setLeaveBalance] = useState(null);

  const handleLogout = () => {
    try {
      logout();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = () => {
    try {
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  }

  const fetchData = async () => {
    try {
      if (getAuth && getAuth.user) {
        const { getProfile } = await getUserProfile(auth.user._id);
        setLeaveBalance(getProfile.leaveBalance);
        if (getProfile?.photo === null) {
          setPhoto('')
          setIsPhoto(false)
          
        } else {
          setPhoto(getProfile.photo);
          setIsPhoto(true)
        }
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
  
  const redirectPath = auth?.user?.role === "admin" ? `/dashboard/user/admin-profile/${auth?.user?._id}` : `/dashboard-user/user/user-profile/${auth?.user?._id}`;

  return (
    <>
      {auth?.user?.role === "user" &&
        <LeaveBalanceDisplay leaveBalance={leaveBalance} />
      }
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          {isPhoto ?
            <CImage align="start" rounded src={photo} width={30} height={30} alt="User Avatar" />
            :
            <Avatar icon="pi pi-user" style={{ backgroundColor: '#2196F3', color: '#ffffff', borderRadius: "5px" }} />
          }
        </CDropdownToggle>
        <CDropdownMenu className="pt-0 dropdown" placement="bottom-end">
          <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
          {getAuth &&
            <>
              <CDropdownItem onClick={() => navigate(redirectPath)}>
                <CIcon icon={cilUser} className="me-2" />
                Profile
              </CDropdownItem>
              <CDropdownItem onClick={() => navigate(`/dashboard-user/user/resetPassword`)}>
                <MdOutlineLockReset className="me-2" fontSize={20} />
                Reset Password
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
    </>
  );
};

export default AppHeaderDropdown;
