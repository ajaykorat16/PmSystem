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
import AdminProfile from './pages/AdminProfile';
import './scss/style.scss';
import { Routes, Route } from 'react-router-dom';
import UserRoutes from './components/Routes/UserRoutes';
import ResetPassword from './pages/ResetPassword';
import "primereact/resources/themes/rhea/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import LeaveManagementList from './pages/LeavemanagementList';
import EmployeeList from './pages/EmployeeList';
import EmployeeByBirthMonth from './pages/EmployeeByBirhtMonth';
import ProjectCreate from './pages/ProjectCreate';
import ProjectList from './pages/ProjectList';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DefaultLayout />} />
        <Route path="/dashboard" element={<AdminRoutes />}>
          <Route path="user/list" element={<UserList title="User List" />} />
          <Route path="user/birtday/list" element={<EmployeeByBirthMonth title="Employee By Birth Month" />} />
          <Route path="user/create" element={<UserCreate title="User Create" />} />
          <Route path="user/update/:id" element={<UserUpdate title="User Update" />} />
          <Route path="user/admin-profile/:id" element={<AdminProfile title="Profile" />} />
          <Route path="user/resetPassword" element={<ResetPassword title="Reset Password" />} />
          <Route path="leave/list" element={<LeaveList title="Leave List" />} />
          <Route path="leave/create" element={<LeaveCreate title="Leave Create" />} />
          <Route path="leave/update/:id" element={<LeaveUpdate title="Leave Update" />} />
          <Route path="leaveManagement/list" element={<LeaveManagementList title="Leave Manage" />} />
          <Route path="department/list" element={<DepartmentList title="Department List" />} />
          <Route path="department/create" element={<DepartmentCreate title="Create Department" />} />
          <Route path="department/update/:id" element={<DepartmentUpdate title="Deaprtment Update" />} />
          <Route path="project/create" element={<ProjectCreate title="Create Project "/>} />
          <Route path="project/list" element={<ProjectList title="Project List" />} />
        </Route>
        <Route path='/dashboard-user' element={<UserRoutes />}>
          <Route path="leave/list" element={<LeaveList title="Leave List" />} />
          <Route path="employee/list" element={<EmployeeList title="Employee List" />} />
          <Route path="employee/birtday/list" element={<EmployeeByBirthMonth title="Employee By Birth Month" />} />
          <Route path="leave/create" element={<LeaveCreate title="Leave Create" />} />
          <Route path="user/user-profile/:id" element={<UserProfile title="Profile" />} />
          <Route path="user/resetPassword" element={<ResetPassword title="Reset Password" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
