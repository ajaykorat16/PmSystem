import { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios'
import toast from "react-hot-toast"


const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({
        user: null,
        token: ""
    })
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    //default axios
    axios.defaults.headers.common["Authorization"] = auth?.token

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/user/login', { email, password });

            if (data.error === false) {
                setIsLoggedIn(true)
                toast.success('Login successful');
                setAuth({
                    ...auth,
                    user: data.user,
                    token: data.token
                })
                localStorage.setItem('auth', JSON.stringify(data))
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    errors.forEach((error) => {
                        toast.error(error.msg);
                    });
                } else {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                }
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }

    };

    // Function to handle logout
    const logout = () => {
        try {
            const data = localStorage.getItem('auth')
            if (data) {
                localStorage.removeItem("auth")
                setAuth({
                    user: null,
                    token: ""
                })
                setIsLoggedIn(false)
            }

        } catch (error) {

        }
    };

    useEffect(() => {
        const data = localStorage.getItem('auth')
        if (data) {
            const parseData = JSON.parse(data)
            setAuth({
                ...auth,
                user: parseData.user,
                token: parseData.token
            })
        }
    }, [])

    return (
        <AuthContext.Provider value={{ auth, login, logout, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )

}

//custom hook 
const useAuth = () => useContext(AuthContext)

export { useAuth, AuthProvider }