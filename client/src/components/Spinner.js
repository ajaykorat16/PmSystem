import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";



const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(2);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    count === 0 &&
      navigate(`/${path}`, {
        state: location.pathname,
      });
    return () => clearInterval(interval);
  }, [count, navigate, location, path]);
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