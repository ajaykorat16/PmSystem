import React, { useContext, createContext } from "react";
import axios from 'axios';
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const { auth } = useAuth();
    const headers = {
        Authorization: auth.token
    };

    //get users
    const fetchUsers = async () => {
        try {
            const res = await axios.get("/user/userList", { headers });
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
            let res;
            if (query) {
                res = await axios.post(`/user/user-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`/user`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get All Users
    const getAllUsersByBirthMonth = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`/user/getUserByBirthDayMonth-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`/user/getUserByBirthDayMonth`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get All Employee
    const getAllEmployee = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`/user/user-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`/user/employeeList`, { params: { page, limit, sortField, sortOrder } }, { headers });
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
            const { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining } = addUser

            const { data } = await axios.post("/user/addUser", { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining }, { headers });
            if (data.error === false) {
                fetchUsers()
                setTimeout(function () {
                    toast.success("User created successfully")
                }, 1000);
            }
            return data;
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

    //update user
    const updateUser = async (updateUsers, id) => {
        try {
            let { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining, photo } = updateUsers
            const editUser = new FormData()
            editUser.append("employeeNumber", employeeNumber)
            editUser.append("firstname", firstname)
            editUser.append("lastname", lastname)
            editUser.append("email", email)
            editUser.append("phone", phone)
            editUser.append("address", address)
            editUser.append("department", department)
            editUser.append("dateOfJoining", dateOfJoining)
            editUser.append("dateOfBirth", dateOfBirth)
            photo && editUser.append("photo", photo);

            const { data } = await axios.put(`/user/updateProfile/${id}`, editUser, { headers });
            if (data.error === false) {
                fetchUsers()
                setTimeout(function () {
                    toast.success("User updated successfully")
                }, 1000);
            }
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    //update user
    const updateProfile = async (updateUsers) => {
        try {
            let { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, dateOfJoining, photo } = updateUsers

            const editUser = new FormData()
            editUser.append("employeeNumber", employeeNumber)
            editUser.append("firstname", firstname)
            editUser.append("lastname", lastname)
            editUser.append("email", email)
            editUser.append("phone", phone)
            editUser.append("address", address)
            editUser.append("dateOfJoining", dateOfJoining)
            editUser.append("dateOfBirth", dateOfBirth)
            photo && editUser.append("photo", photo);

            const { data } = await axios.put(`/user/updateProfile`, editUser, { headers });
            if (data.error === false) {
                toast.success("Profile updated successfully")
            }
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    //delete user
    const deleteUser = async (id) => {
        try {
            const { data } = await axios.delete(`/user/deleteProfile/${id}`, { headers });
            if (data.error === false) {
                fetchUsers()
                toast.success("User deleted successfully")
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get single user
    const getUserProfile = async (id) => {
        try {
            const { data } = await axios.get(`/user/getUserProfile/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //reset password
    const resetPassword = async (password) => {
        try {
            const { data } = await axios.put(`/user/resetPassword`, { password }, { headers })
            if (data.error === false) {
                setTimeout(function () {
                    toast.success("Password updated successfully")
                }, 500);
            }
            return data;
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
    }

    return (
        <UserContext.Provider value={{ fetchUsers, createUser, updateUser, deleteUser, getUserProfile, updateProfile, resetPassword, getAllUsers, getAllEmployee, getAllUsersByBirthMonth }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
