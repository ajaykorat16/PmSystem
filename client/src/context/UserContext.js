import { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios'
import { useAuth } from "./AuthContext";

const UserContext = createContext()

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([])
    const { auth } = useAuth()
    const getUsers = async () => {
        try {
            console.log("auth--->", auth)
            const res = await axios.get(`/user/userList`)

            if (res.data.error === false) {
                console.log("res--->", res)
                setUsers(res.data.getAllUsers)
            }

        } catch (error) {
            console.log(error)
        }
    };

    return (
        <UserContext.Provider value={{ getUsers }}>
            {children}
        </UserContext.Provider>
    )

}

//custom hook 
const useUser = () => useContext(UserContext)

export { useUser, UserProvider }