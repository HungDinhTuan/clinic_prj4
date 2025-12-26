import axios from 'axios';
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const TestingStaffContext = createContext();

const TestingStaffContextProvider = ({ children }) => {

    const backendTestingStaffUrl = import.meta.env.VITE_BACKEND_TESTING_STAFF_URL;

    const [tToken, setTToken] = useState(localStorage.getItem('tToken') ? localStorage.getItem('tToken') : '');
    const [profileData, setProfileData] = useState(false);

    const value = {
        backendTestingStaffUrl,
        tToken,
        setTToken
    };

    return (
        <TestingStaffContext.Provider value={value}>
            {children}
        </TestingStaffContext.Provider>
    )
}

export default TestingStaffContextProvider