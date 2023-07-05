import { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios'

const AuthContext = createContext()


const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({
        user: null,
        token: ""
    })

    //default axios
    axios.defaults.headers.common["Authorization"] = auth?.token

    const login = async (email, password) => {
        try {
            const res = await axios.post(`/user/login`, { email, password })

            if (res.data.error === false) {
                localStorage.setItem('auth', JSON.stringify(res.data))
                setAuth({
                    ...auth,
                    user: res.data.user,
                    token: res.data.token
                })
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
                localStorage.removeItem("auth")
                setAuth({
                    user: null,
                    token: ""
                })
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
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    )

}

//custom hook 
const useAuth = () => useContext(AuthContext)

export { useAuth, AuthProvider }