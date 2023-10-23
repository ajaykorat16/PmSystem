import React from 'react';
import AppSidebar from '../components/AppSidebar';
import AppHeader from '../components/AppHeader';
import { Toast } from 'primereact/toast';

const Layout = ({ children, title, toast }) => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader title={title} />
        <Toast ref={toast} />
        <div className="body flex-grow-1 px-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
