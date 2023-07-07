import AdminRoutes from './components/Routes/AdminRoutes';
import DefaultLayout from './pages/DefaultLayout';
import DepartmentCreate from './pages/DepartmentCreate';
import DepartmentList from './pages/DepartmentList';
import LeaveCreate from './pages/LeaveCreate';
import LeaveList from './pages/LeaveList';
import LeaveUpdate from './pages/LeaveUpdate';
import Login from './pages/Login';
import UserCreate from './pages/UserCreate';
import UserList from './pages/UserList';
import UserUpdate from './pages/UserUpdate';
import './scss/style.scss';
import { Routes, Route } from 'react-router-dom'


function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminRoutes />}>
          <Route path="/home" element={<DefaultLayout />} />
          <Route path="/user/list" element={<UserList />} />
          <Route path="/user/create" element={<UserCreate />} />
          <Route path="/user/update/:id" element={<UserUpdate />} />
          <Route path="/leave/list" element={<LeaveList />} />
          <Route path="/leave/create" element={<LeaveCreate />} />
          <Route path="/leave/update/:id" element={<LeaveUpdate />} />
          <Route path="/department/list" element={<DepartmentList />} />
          <Route path="/department/create" element={<DepartmentCreate />} />
          <Route path="/department/update/:id" element={<DepartmentUpdate/>}/>
        </Route>
      </Routes>
    </>
  );
}

export default App;
