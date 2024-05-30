import { useContext, createContext } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from "axios";

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
    const { auth, toast } = useAuth();

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
    const createProject = async (addproject) => {
        try {
            const { data } = await axios.post(`${baseURL}/projects/create`, addproject, { headers });

            if (data.error === false) {
                getProject()
                setTimeout(function () {
                    toast.current.show({ severity: 'success', summary: 'Project', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current.show({ severity: 'info', summary: 'Project', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current.show({ severity: 'error', summary: 'Project', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Project', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Project', detail: 'An error occurred. Please try again later.', life: 3000 })
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
                    toast.current.show({ severity: 'success', summary: 'Project', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current.show({ severity: 'info', summary: 'Project', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response.status === 500) {
                toast.current.show({ severity: 'error', summary: 'Project', detail: 'Project Already Exists.', life: 3000 });
            }
            console.log(error);
        }
    }

    //delete project
    const deleteProject = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/projects/delete-project/${id}`, { headers });
            if (data.error === false) {
                getProject()
                toast.current.show({ severity: 'success', summary: 'Project', detail: data.message, life: 3000 })
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
