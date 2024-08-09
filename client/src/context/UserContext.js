import React, { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from 'axios';

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth.token
    };

    //get users
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${baseURL}/user/userList`, { headers });
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    };

    //get All Users
    const getAllUsers = async (page, limit, query, sortField, sortOrder) => {
        try {
            const res = await axios.get(`${baseURL}/user`, { params: { page, limit, sortField, sortOrder, filter: query } }, { headers });
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get All Users
    const getAllUsersByBirthMonth = async (page, limit, query) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/user/getUserByBirthDayMonth-search`, { filter: query }, { params: { page, limit }, headers: headers });
            } else {
                res = await axios.get(`${baseURL}/user/getUserByBirthDayMonth`, { params: { page, limit } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //add user
    const createUser = async (addUser) => {
        try {

            const { data } = await axios.post(`${baseURL}/user/addUser`, addUser, { headers });
            if (data.error === false) {
                fetchUsers()
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current.show({ severity: 'error', summary: 'User', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current.show({ severity: 'error', summary: 'User', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    //update user
    const updateUser = async (userDetail, id) => {
        try {
            console.log(userDetail);
            
            // let { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining, photo, projects } = userDetail

            // const editUser = new FormData()
            // editUser.append("employeeNumber", employeeNumber)
            // editUser.append("firstname", firstname)
            // editUser.append("lastname", lastname)
            // editUser.append("email", email)
            // editUser.append("phone", phone)
            // editUser.append("address", address)
            // editUser.append("department", department)
            // editUser.append("dateOfJoining", dateOfJoining)
            // editUser.append("dateOfBirth", dateOfBirth)
            // editUser.append("projects", JSON.stringify(projects))
            // photo && editUser.append("photo", photo);

            const { data } = await axios.put(`${baseURL}/user/updateProfile/${id}`, userDetail, { headers });
            console.log("CONTEXT------------", data);
            if (data.error === false) {
                
                fetchUsers()
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'User', detail: 'User detail is updated successfully.', life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //update user
    const updateProfile = async (updateUsers) => {
        try {
            let { firstname, lastname, phone, address, dateOfBirth, photo } = updateUsers

            const editUser = new FormData()
            editUser.append("firstname", firstname)
            editUser.append("lastname", lastname)
            editUser.append("phone", phone)
            editUser.append("address", address)
            editUser.append("dateOfBirth", dateOfBirth)
            photo && editUser.append("photo", photo);

            const { data } = await axios.put(`${baseURL}/user/updateProfile`, editUser, { headers });
            if (data.error === false) {
                toast.current.show({ severity: 'success', summary: 'Profile', detail: 'Your profile is updated successfully.', life: 3000 })
                return data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    //delete user
    const deleteUser = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/user/deleteProfile/${id}`, { headers });
            if (data.error === false) {
                fetchUsers()
                toast.current.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get single user
    const getUserProfile = async (id) => {
        try {
            const { data } = await axios.get(`${baseURL}/user/getUserProfile/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //reset password
    const resetPassword = async (password) => {
        try {
            const { data } = await axios.put(`${baseURL}/user/resetPassword`, { password }, { headers })
            if (data.error === false) {
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'Password', detail: data.message, life: 3000 })
                }, 500);
                return data;
            } else {
                toast.current.show({ severity: 'error', summary: 'Password', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current.show({ severity: 'error', summary: 'Password', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Password', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Password', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const userForCredential = async () => {
        try {
            const res = await axios.get(`${baseURL}/user/credentialUser`, { headers });
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <UserContext.Provider value={{ fetchUsers, createUser, updateUser, deleteUser, getUserProfile, updateProfile, resetPassword, getAllUsers, getAllUsersByBirthMonth, userForCredential }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
