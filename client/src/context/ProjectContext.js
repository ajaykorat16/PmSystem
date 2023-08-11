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
  
    //create project
    
  
    //delete user
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

    return (
      <ProjectContext.Provider value={{ getProject, deleteProject }}>
        {children}
      </ProjectContext.Provider>
    );
};

//custom hook
const useProject = () => useContext(ProjectContext);

export { useProject, ProjectProvider };
