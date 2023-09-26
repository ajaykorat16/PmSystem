import { useState, useEffect, useContext, createContext } from "react";
import { baseURL } from "../lib";
import axios from 'axios'
import toast from "react-hot-toast"

const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({
        user: null,
        token: ""
    })

    const [adminAuth, setAdminAuth] = useState({
        user: null,
        token: ""
    })

    const [isLoggedIn, setIsLoggedIn] = useState(false)

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

            const adminAuth = localStorage.getItem("adminAuth")
            if (adminAuth) {
                localStorage.removeItem("adminAuth")
                setAdminAuth({
                    user: null,
                    token: ""
                })
                setIsLoggedIn(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    axios.defaults.headers.common["Authorization"] = auth?.token === '' ? logout() : auth.token

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/login`, { email, password });
            if (data.error === false) {
                setIsLoggedIn(true)
                setTimeout(function () {
                    toast.success(data.message)
                }, 500);
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
                    toast.error("Please fill all fields")
                } else {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                }
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }
    };

    const loginUserByAdmin = async (email) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/loginByAdmin`, { email });
            if (data.error === false) {
                setIsLoggedIn(true)

                let auth = localStorage.getItem('auth')
                if (auth) {
                    localStorage.setItem('adminAuth', auth)
                    const parseData = JSON.parse(auth)
                    setAdminAuth({
                        ...adminAuth,
                        user: parseData.user,
                        token: parseData.token
                    })
                    localStorage.removeItem("auth")
                    setAuth({
                        ...auth,
                        user: data.user,
                        token: data.token
                    })
                    localStorage.setItem('auth', JSON.stringify(data))
                }
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.error("Please fill all fields")
                } else {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                }
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }
    };

    const backToAdmin = async () => {
        try {
            let auth = localStorage.getItem('adminAuth')
            const parseData = JSON.parse(auth)

            const { data } = await axios.post(`${baseURL}/user/loginByAdmin`, { email: parseData?.user.email });
            if (data.error === false) {
                setIsLoggedIn(true)
                setTimeout(function () {
                    toast.success(data.message)
                }, 500);

                if (auth) {
                    localStorage.removeItem("adminAuth")
                    setAdminAuth({
                        ...adminAuth,
                        user: null,
                        token: ''
                    })
                    setAuth({
                        ...auth,
                        user: data.user,
                        token: data.token
                    })
                    localStorage.setItem('auth', JSON.stringify(data))
                }
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.error("Please fill all fields")
                } else {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                }
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }
    }

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

        const adminData = localStorage.getItem('adminAuth')
        if (adminData) {
            const parseData = JSON.parse(adminData)
            setAdminAuth({
                ...adminAuth,
                user: parseData.user,
                token: parseData.token
            })
        }
    }, [])

    return (
        <AuthContext.Provider value={{ auth, login, logout, isLoggedIn, adminAuth, loginUserByAdmin, backToAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)

export { useAuth, AuthProvider }