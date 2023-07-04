import DefaultLayout from './pages/DefaultLayout';
import DepartmentCreate from './pages/DepartmentCreate';
import DepartmentList from './pages/DepartmentList';
import LeaveCreate from './pages/LeaveCreate';
import LeaveList from './pages/LeaveList';
import Login from './pages/Login';
import UserCreate from './pages/UserCreate';
import UserList from './pages/UserList';
import './scss/style.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<DefaultLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/list" element={<UserList />} />
          <Route path="/user/create" element={<UserCreate />} />
          <Route path="/leave/list" element={<LeaveList />} />
          <Route path="/leave/create" element={<LeaveCreate />} />
          <Route path="/department/list" element={<DepartmentList />} />
          <Route path="/department/create" element={<DepartmentCreate />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
