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
import EmployeeByBirthMonth from './pages/EmployeeByBirhtMonth';
import ProjectCreate from './pages/ProjectCreate';
import ProjectList from './pages/ProjectList';
import ProjectUpdate from './pages/ProjectUpdate';
import WorkLogCreate from './pages/WorkLogCreate';
import UserWorkLogList from './pages/UserWorkLogList';
import AdminWorkLogList from './pages/AdminWorkLogList';
import UserWorkLogUpdate from './pages/UserWorkLogUpdate';
import CredentialCreate from './pages/CredentialCreate';
import CredentialList from './pages/CredentialList';
import CredentialUpdate from './pages/CredentialUpdate';
import CredentialView from './pages/CredentialView';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminRoutes />}>
          <Route path="admin" element={<DefaultLayout />} />
          <Route path="user/list" element={<UserList title="User List" />} /> {/* DONE */}
          <Route path="user/birthday/list" element={<EmployeeByBirthMonth title="Employee By Birth Month" />} /> {/* DONE */}
          <Route path="user/create" element={<UserCreate title="User Create" />} /> { /* DONE */}
          <Route path="user/update/:id" element={<UserUpdate title="User Update" />} /> { /* DONE */}
          <Route path="user/admin-profile/:id" element={<AdminProfile title="Profile" />} /> {/* DONE */}
          <Route path="user/resetPassword" element={<ResetPassword title="Reset Password" />} /> {/* DONE */}
          <Route path="leave/list" element={<LeaveList title="Leave List" />} />  {/* DONE */}
          <Route path="leave/create" element={<LeaveCreate title="Leave Create" />} /> {/* DONE */}
          <Route path="leave/update/:id" element={<LeaveUpdate title="Leave Update" />} /> {/* DONE */}
          <Route path="manageMonthlyLeave/list" element={<LeaveManagementList title="Manage Monthly Leave" />} /> {/* DONE */}
          <Route path="department/list" element={<DepartmentList title="Department List" />} /> {/* DONE */}
          <Route path="department/create" element={<DepartmentCreate title="Create Department" />} /> {/* DONE */}
          <Route path="department/update/:id" element={<DepartmentUpdate title="Deaprtment Update" />} /> {/* DONE */}
          <Route path="project/list" element={<ProjectList title="Project List" />} /> {/* DONE */}
          <Route path="project/create" element={<ProjectCreate title="Create Project " />} /> {/* DONE */}
          <Route path="project/update/:id" element={<ProjectUpdate title="Update Project" />} />  {/* DONE */}
          <Route path="workLog/list" element={<AdminWorkLogList title="Work Log List" />} /> {/*DONE*/}
          <Route path="credential/create" element={<CredentialCreate title="Create Credentials" />} /> {/*DONE*/}
          <Route path="credential/update/:id" element={<CredentialUpdate title="Update Credentials" />} /> {/*DONE*/}
          <Route path="credential/list" element={<CredentialList title="Credential List" />} /> {/* DONE */}
          <Route path="credential/view/:id" element={<CredentialView title="Credential Detail" />} /> {/*DONE*/}
        </Route>
        <Route path='/dashboard-user' element={<UserRoutes />}>
          <Route path="employee" element={<DefaultLayout />} />
          <Route path="leave/list" element={<LeaveList title="Leave List" />} /> {/* DONE */}
          <Route path="employee/list" element={<UserList title="Employee List" />} /> {/* DONE */}
          <Route path="employee/birthday/list" element={<EmployeeByBirthMonth title="Employee By Birth Month" />} /> {/* DONE */}
          <Route path="leave/create" element={<LeaveCreate title="Leave Create" />} /> { /* DONE */}
          <Route path="leave/update/:id" element={<LeaveUpdate title="Leave Update" />} /> {/* DONE */}
          <Route path="user/user-profile/:id" element={<UserProfile title="Profile" />} /> {/* DONE */}
          <Route path="user/resetPassword" element={<ResetPassword title="Reset Password" />} /> {/* DONE */}
          <Route path="project/list" element={<ProjectList title="Your Projects" />} /> {/* DONE */}
          <Route path="workLog/create" element={<WorkLogCreate title="Create Work Log " />} /> {/*DONE*/}
          <Route path="workLog/update/:id" element={<UserWorkLogUpdate title="Update Work Log" />} /> {/*DONE*/}
          <Route path="workLog/list" element={<UserWorkLogList title="Work Log List" />} /> {/*DONE*/}
          <Route path="credential/create" element={<CredentialCreate title="Create Credentials" />} /> {/*DONE*/}
          <Route path="credential/update/:id" element={<CredentialUpdate title="Update Credentials" />} /> {/*DONE*/}
          <Route path="credential/list" element={<CredentialList title="Credential List" />} /> {/* DONE */}
          <Route path="credential/view/:id" element={<CredentialView title="Credential Detail" />} /> {/*DONE*/}
        </Route>
      </Routes>
    </>
  );
}

export default App;
