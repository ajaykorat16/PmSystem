import React, { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios';
import { useAuth } from "./AuthContext";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const { auth } = useAuth();
    const headers = {
        Authorization: auth.token
    };
    useEffect(() => {
        console.log("authhhhhhh", auth);
        const fetchUsers = async () => {
            try {
                const res = await axios.get("/user/userList", { headers });
                if (res.data.error === false) {
                    setUsers(res.data.getAllUsers);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchUsers();
    }, [auth?.token]);


    const createUser = async (addUser) => {
        try {
            const { firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining } = addUser
            const res = await axios.post("/user/addUser", { firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining }, { headers });
        } catch (error) {
            console.log(error);
        }
    }

    const updateUser = async (firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining) => {
        try {
            const res = await axios.put("/user/updateProfile", { firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining }, { headers });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <UserContext.Provider value={{ users, createUser, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook
const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
