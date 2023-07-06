import React, { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios';
import { useAuth } from "./AuthContext";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [getUser, setGetUsers] = useState([])
    const { auth } = useAuth();
    const headers = {
        Authorization: auth.token
    };


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

    useEffect(() => {
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


    const updateUser = async (updateUsers, id) => {
        try {
            let { firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining } = updateUsers
            const editUser = new FormData()
            editUser.append("firstname", firstname)
            editUser.append("lastname", lastname)
            editUser.append("email", email)
            editUser.append("phone", phone)
            editUser.append("address", address)
            editUser.append("department", department)
            editUser.append("dateOfJoining", dateOfJoining)
            editUser.append("dateOfBirth", dateOfBirth)

            await axios.put(`/user/updateProfile/${id}`, editUser, { headers });
            fetchUsers()
        } catch (error) {
            console.log(error);
        }
    }


    const deleteUser = async (id) => {
        try {
            const res = await axios.delete(`/user/deleteProfile/${id}`, { headers });
            fetchUsers()
        } catch (error) {
            console.log(error);
        }
    }


    const getUserProfile = async (id) => {
        try {
            const res = await axios.get(`/user/getUserProfile/${id}`, { headers });
        } catch (error) {
            console.log(error);
        }
    }

    
    return (
        <UserContext.Provider value={{ users, createUser, updateUser, deleteUser, getUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook
const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
