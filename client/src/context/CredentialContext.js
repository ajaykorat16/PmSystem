import React, { useContext, createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from 'axios';

const CredentialsContext = createContext();

const CredentialProvider = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth.token
    };

    //create credentials
    const addCredentials = async (credentials) => {
        try {
            const { data } = await axios.post(`${baseURL}/credential/create`, credentials, { headers })
            
            if (data.error === false) {
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'Credential', detail: data.message, life: 3000 })
                }, 1000);

                return data;
            } else {
                toast.current.show({ severity: 'info', summary: 'Credential', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current.show({ severity: 'error', summary: 'Credential', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Credential', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Credential', detail: 'An error occurred. Please try again later.', life: 3000 })
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
                toast.current.show({ severity: 'success', summary: 'Credential', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //update Credentials
    const updateCredential = async (credentialData, id) => {
        try {
            const { data } = await axios.put(`${baseURL}/credential/update/${id}`, credentialData, { headers })
            if (data.error === false) {
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'Credential', detail: data.message, life: 3000 })
                }, 1000);
                return data
            } else {
                toast.current.show({ severity: 'info', summary: 'Credential', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get single Credentials
    const getSingleCredential = async (id) => {
        try {
            const { data } = await axios.get(`${baseURL}/credential/single-credential/${id}`, { headers });
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <CredentialsContext.Provider value={{ addCredentials, getAllCredentials, getSingleCredential, updateCredential, deleteCredentials }}>
            {children}
        </CredentialsContext.Provider>
    );
}

const useCredential = () => useContext(CredentialsContext);

export { useCredential, CredentialProvider }