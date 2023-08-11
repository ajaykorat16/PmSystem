import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux'
import store from './store';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { BrowserRouter } from 'react-router-dom';
import { LeaveProvider } from './context/LeaveContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { LeaveManagementProvider } from './context/LeaveManagementContext';
import { ProjectProvider } from './context/ProjectContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <AuthProvider>
    <DepartmentProvider>
      <UserProvider>
        <ProjectProvider>
          <LeaveProvider>
            <LeaveManagementProvider>
              <Provider store={store}>
                <React.StrictMode>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </React.StrictMode>
              </Provider>
            </LeaveManagementProvider>
          </LeaveProvider>
        </ProjectProvider>
      </UserProvider>
    </DepartmentProvider>
  </AuthProvider>
);

