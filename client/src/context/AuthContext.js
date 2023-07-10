import { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({
        user: null,
        token: ""
    })
    const [isLoggedIn,setIsLoggedIn]=useState(false)

    //default axios
    axios.defaults.headers.common["Authorization"] = auth?.token

    const login = async (email, password) => {
        try {
            const res = await axios.post(`/user/login`, { email, password })

            if (res.data.error === false) {
                setIsLoggedIn(true)
                setAuth({
                    ...auth,
                    user: res.data.user,
                    token: res.data.token
                })
                localStorage.setItem('auth', JSON.stringify(res.data))
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
        <AuthContext.Provider value={{ auth, login, logout,isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )

}

//custom hook 
const useAuth = () => useContext(AuthContext)

export { useAuth, AuthProvider }