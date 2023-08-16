import { useContext, createContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WorklogContext = createContext();

const WorklogProvider = ({ children }) => {
    const { auth } = useAuth();
    const headers = {
        Authorization: auth?.token,
    };

    //get worklog
    const getWorklog = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`/worklog/search-worklog?page=${page}&limit=${limit}`, { filter: query }, { headers });
            } else {
                res = await axios.get(`/worklog/user-worklog`, { params: { page, limit, sortField, sortOrder } }, { headers });
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
                res = await axios.post(`/worklog/admin-search-worklog?page=${page}&limit=${limit}`, { filter }, { headers });
            } else {
                res = await axios.get(`/worklog`, { params: { page, limit, sortField, sortOrder } }, { headers });
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
            const { data } = await axios.get(`/worklog/single-worklog/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //add workLog
    const createWorkLog = async (addWorkLog) => {
        try {
            const { project, description, logDate, time } = addWorkLog

            const { data } = await axios.post("/worklog/create", { project, description, logDate, time }, { headers });
            if (data.error === false) {
                getWorklog()
                setTimeout(function () {
                    toast.success(data.message)
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

    //update project
    const updateWorklog = async (worklog, id) => {
        try {
            let { project, description, logDate, time } = worklog

            const { data } = await axios.put(`/worklog/update-worklog/${id}`, { project, description, logDate, time }, { headers });
            if (data.error === false) {
                getWorklog()
                setTimeout(function () {
                    toast.success(data.message)
                }, 1000);
            }
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    //delete project
    const deleteWorklog = async (id) => {
        try {
            const { data } = await axios.delete(`/worklog/delete-worklog/${id}`, { headers });
            if (data.error === false) {
                getWorklog()
                toast.success(data.message)
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
