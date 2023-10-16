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

    return (
        <CredentialsContext.Provider value={{ addCredentials }}>
            {children}
        </CredentialsContext.Provider>
    );
}

const useCredential = () => useContext(CredentialsContext);

export { useCredential, CredentialProvider }