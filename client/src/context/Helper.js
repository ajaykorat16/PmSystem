import moment from "moment";
import { useContext, createContext } from "react";

const HelperContext = createContext()

const HelperProvider = ({ children }) => {

    const formatDate = (date, format = 'YYYY-MM-DD') => {
        const inputTime = moment(date);
        return inputTime.format(format);
    };

    return (
        <HelperContext.Provider value={{ formatDate }}>
            {children}
        </HelperContext.Provider>
    )
}

const useHelper = () => useContext(HelperContext)

export { useHelper, HelperProvider }