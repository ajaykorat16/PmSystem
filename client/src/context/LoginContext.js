import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';

// Create a new context
const LoginContext = createContext();

// Create a provider component
const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    // Function to handle login
    const login = async (email, password) => {
        try {
            const res = await axios.post(`/user/login`, { email, password })

            if (res.data.error === false) {
                // setAuth({
                //     ...auth,
                //     user: res.data.user,
                //     token: res.data.token
                // })
                localStorage.setItem('auth', JSON.stringify(res.data))
                setIsLoggedIn(true);
            }


        } catch (error) {
            console.log(error)
        }
    };

    // Function to handle logout
    const logout = () => {
        try {
            const data = localStorage.getItem('auth')
            if (data) {
                // setAuth({
                //     user: null,
                //     token: ""
                // })
                localStorage.removeItem("auth")
                setIsLoggedIn(false);
            }

        } catch (error) {

        }
    };

    // Provide the context values to the children components
    return (
        <LoginContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </LoginContext.Provider>
    );
};

//custom hook 
const useLogin = () => useContext(LoginContext)

export { useLogin, LoginProvider }