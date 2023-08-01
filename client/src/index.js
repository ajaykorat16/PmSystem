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



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <DepartmentProvider>
      <UserProvider>
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
      </UserProvider>
    </DepartmentProvider>
  </AuthProvider>


);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

