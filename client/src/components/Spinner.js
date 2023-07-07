import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";



const Spinner = ({ path = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { token } = localStorage.getItem('auth')
    token &&
      navigate(`/${path}`, {
        state: location.pathname,
      });
  }, [navigate, location, path]);
  return (
    <>
      <div>
        <AppSidebar />
        <div className="wrapper d-flex flex-column min-vh-100 bg-light">
          <AppHeader />
          <div className="body flex-grow-1 px-3">
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ height: "100vh" }}
            >
              {/* <h1 className="Text-center">redirecting to you in {count} second </h1> */}
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Spinner;