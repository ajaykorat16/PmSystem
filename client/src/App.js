import DefaultLayout from './pages/DefaultLayout';
import DepartmentList from './pages/DepartmentList';
import LeaveList from './pages/LeaveList';
import UserList from './pages/UserList';
import './scss/style.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<DefaultLayout />} />
          <Route path="/user/list" element={<UserList />} />
          <Route path="/leave/list" element={<LeaveList />} />
          <Route path="/department/list" element={<DepartmentList />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
