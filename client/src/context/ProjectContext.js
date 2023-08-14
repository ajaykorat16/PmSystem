import { useContext, createContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
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
            const res = await axios.get("/projects/project-list", { headers });
            if (res.data.error === false) {
                return res.data
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
                res = await axios.post(`/projects/project-search?page=${page}&limit=${limit}`, { filter: query }, { headers });
            } else {
                res = await axios.get(`/projects`, { params: { page, limit, sortField, sortOrder } }, { headers });
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
            const { data } = await axios.get(`/projects/single-project/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //add project
    const createProject = async (addUser) => {
        try {
            const { name, description, startDate, developers } = addUser

            const { data } = await axios.post("/projects/create", { name, description, startDate, developers }, { headers });
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
            let { name, description, startDate, developers } = project

            const { data } = await axios.put(`/projects/update-project/${id}`, { name, description, startDate, developers }, { headers });
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
            const { data } = await axios.delete(`/projects/delete-project/${id}`, { headers });
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
                res = await axios.post(`/projects/search-project-list?page=${page}&limit=${limit}`, { filter: query }, { headers });
            } else {
                res = await axios.get(`/projects/developer-project-list`, { params: { page, limit, sortField, sortOrder } }, { headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <ProjectContext.Provider value={{ getProject, fetchProjects, getSingleProject, createProject, updateProject, deleteProject, userProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

//custom hook
const useProject = () => useContext(ProjectContext);

export { useProject, ProjectProvider };
