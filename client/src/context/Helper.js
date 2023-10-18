import moment from "moment";
import { useContext, createContext } from "react";

const HelperContext = createContext()

const HelperProvider = ({ children }) => {

    const formatDate = (date, format = 'YYYY-MM-DD') => {
        if (date !== "") {
            const inputTime = moment(date);
            return inputTime.format(format);
        } else {
            return ""
        }
    };

    const onShow = () => {
        let selectAllCheckbox = document.querySelector(
            ".p-multiselect-header > .p-checkbox"
        );
        selectAllCheckbox.after(" Select All");
    };

    return (
        <HelperContext.Provider value={{ formatDate, onShow }}>
            {children}
        </HelperContext.Provider>
    )
}

const useHelper = () => useContext(HelperContext)

export { useHelper, HelperProvider }