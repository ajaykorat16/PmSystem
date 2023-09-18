import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";
import toast from "react-hot-toast";

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
    const { auth } = useAuth();
    const headers = {
        Authorization: auth?.token,
    };

    //get projects
    const fetchProjects = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/projects/project-list`, { headers });
            if (data.error === false) {
                return data
            }
        } catch (error) {
            console.log(error);
        }
    };

    //getProjects
    const getProject = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/projects/project-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/projects`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    };

    //get single project
    const getSingleProject = async (id) => {
        try {
            const { data } = await axios.get(`${baseURL}/projects/single-project/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //add project
    const createProject = async (addUser) => {
        try {
            const { data } = await axios.post(`${baseURL}/projects/create`, addUser, { headers });

            if (data.error === false) {
                getProject()
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
    const updateProject = async (project, id) => {
        try {
            const { data } = await axios.put(`${baseURL}/projects/update-project/${id}`, project, { headers });
            if (data.error === false) {
                getProject()
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
    const deleteProject = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/projects/delete-project/${id}`, { headers });
            if (data.error === false) {
                getProject()
                toast.success(data.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    //users project
    const userProject = async (page, limit, query, sortField, sortOrder) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/projects/search-project-list`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/projects/developer-project-list`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get users project
    const getUserProject = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/projects/user-project-list`, { headers });
            if (data.error === false) {
                return data
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <ProjectContext.Provider value={{ getProject, fetchProjects, getSingleProject, createProject, updateProject, deleteProject, userProject, getUserProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

//custom hook
const useProject = () => useContext(ProjectContext);

export { useProject, ProjectProvider };
