import React, { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from 'axios';
import toast from "react-hot-toast";

const CredentialsContext = createContext();

const CredentialProvider = ({ children }) => {
    const { auth } = useAuth();
    const headers = {
        Authorization: auth.token
    };

    const addCredentials = async (credentials) => {
        try {
            const data = await axios.post(`${baseURL}/credential/create`, credentials, { headers })
            if (data.error === false) {
                setTimeout(function () {
                    toast.success(data.message)
                }, 1000);
            }
            return data;
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.error("Please fill all fields")
                    } else {
                        toast.error(errors[0].msg)
                    }
                } else {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                }
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }
    }

    //get All Credentials
    const getAllCredentials = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/credential/search-credential`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`${baseURL}/credential`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //delete Credentials
    const deleteCredentials = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/credential/delete/${id}`, { headers });
            if (data.error === false) {
                getAllCredentials()
                toast.success(data.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <CredentialsContext.Provider value={{ addCredentials, getAllCredentials, deleteCredentials }}>
            {children}
        </CredentialsContext.Provider>
    );
}

const useCredential = () => useContext(CredentialsContext);

export { useCredential, CredentialProvider }