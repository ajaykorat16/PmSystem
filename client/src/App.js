import AdminRoutes from './components/Routes/AdminRoutes';
import DefaultLayout from './pages/DefaultLayout';
import DepartmentCreate from './pages/DepartmentCreate';
import DepartmentList from './pages/DepartmentList';
import DepartmentUpdate from './pages/DepartmentUpdate';
import LeaveCreate from './pages/LeaveCreate';
import LeaveList from './pages/LeaveList';
import LeaveUpdate from './pages/LeaveUpdate';
import Login from './pages/Login';
import UserCreate from './pages/UserCreate';
import UserList from './pages/UserList';
import UserUpdate from './pages/UserUpdate';
import UserProfile from './pages/UserProfile'
import './scss/style.scss';
import { Routes, Route } from 'react-router-dom';
import UserRoutes from './components/Routes/UserRoutes';
import UserLeaveList from './pages/User/UserLeaveList';
import UserLeaveCreate from './pages/User/UserLeaveCreate';
import ResetPassword from './pages/ResetPassword';
import "primereact/resources/themes/lara-light-indigo/theme.css"; 
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";



function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DefaultLayout />} />
        <Route path="/dashboard" element={<AdminRoutes />}>
          <Route path="user/list" element={<UserList />} />
          <Route path="user/create" element={<UserCreate />} />
          <Route path="user/update/:id" element={<UserUpdate />} />
          <Route path="user/user-profile/:id" element={<UserProfile />} />
          <Route path="user/resetPassword" element={<ResetPassword />} />
          <Route path="leave/list" element={<LeaveList />} />
          <Route path="leave/create" element={<LeaveCreate />} />
          <Route path="leave/update/:id" element={<LeaveUpdate />} />
          <Route path="department/list" element={<DepartmentList />} />
          <Route path="department/create" element={<DepartmentCreate />} />
          <Route path="department/update/:id" element={<DepartmentUpdate />} />
        </Route>
        <Route path='/dashboard-user' element={<UserRoutes />}>
          <Route path="leave/list" element={<UserLeaveList/>} />
          <Route path="leave/create" element={<UserLeaveCreate />} />
          <Route path="leave/update/:id" element={<LeaveUpdate />} />
          <Route path="user/user-profile/:id" element={<UserProfile />} />
          <Route path="user/resetPassword" element={<ResetPassword />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
