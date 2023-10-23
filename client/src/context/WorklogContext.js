import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";

const WorklogContext = createContext();

const WorklogProvider = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    //get worklog
    const getWorklog = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/worklog/search-worklog`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`${baseURL}/worklog/user-worklog`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    };

    //get admin worklog
    const getAdminWorklog = async (page, limit, filter, sortField, sortOrder) => {
        try {
            let res;
            if (filter) {
                res = await axios.post(`${baseURL}/worklog/admin-search-worklog?page=${page}&limit=${limit}`, { filter }, { headers });
            } else {
                res = await axios.get(`${baseURL}/worklog`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    // get single worklog
    const getSingleWorklog = async (id) => {
        try {
            const { data } = await axios.get(`${baseURL}/worklog/single-worklog/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //add workLog
    const createWorkLog = async (addWorkLog) => {
        try {
            const { data } = await axios.post(`${baseURL}/worklog/create`, addWorkLog, { headers });

            if (data.error === false) {
                getWorklog()
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'Worklog', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current.show({ severity: 'info', summary: 'Worklog', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current.show({ severity: 'error', summary: 'Worklog', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Worklog', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Worklog', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    //update project
    const updateWorklog = async (worklog, id) => {
        try {
            const { data } = await axios.put(`${baseURL}/worklog/update-worklog/${id}`, worklog, { headers });

            if (data.error === false) {
                getWorklog()
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'Worklog', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current.show({ severity: 'info', summary: 'Worklog', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //delete project
    const deleteWorklog = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/worklog/delete-worklog/${id}`, { headers });
            if (data.error === false) {
                getWorklog()
                toast.current.show({ severity: 'success', summary: 'Worklog', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <WorklogContext.Provider value={{ getWorklog, createWorkLog, deleteWorklog, getAdminWorklog, getSingleWorklog, updateWorklog }}>
            {children}
        </WorklogContext.Provider>
    );
};

//custom hook
const useWorklog = () => useContext(WorklogContext);

export { useWorklog, WorklogProvider };
