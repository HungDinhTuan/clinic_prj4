import axios from 'axios';
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const TestingStaffContext = createContext();

const TestingStaffContextProvider = ({ children }) => {

    const backendTestingStaffUrl = import.meta.env.VITE_BACKEND_TESTING_STAFF_URL;

    const [tToken, setTToken] = useState(localStorage.getItem('tToken') ? localStorage.getItem('tToken') : '');
    const [pendingTests, setPendingTests] = useState([]);
    const [waitingResults, setWaitingResults] = useState([]);
    const [profileData, setProfileData] = useState(false);
    const [medicalTests, setMedicalTests] = useState([]);

    const getAllMedicalTests = async () => {
        try {
            const { data } = await axios.get(`${backendTestingStaffUrl}/medical-tests`, { headers: { tToken } });

            if (data.success) {
                setMedicalTests(data.tests);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response.data.message || e.message);
        }
    }

    const getPendingTests = async () => {
        try {
            const { data } = await axios.get(`${backendTestingStaffUrl}/pending-tests`, { headers: { tToken } });
            if (data.success) {
                setPendingTests(data.pendingTests);
                console.log(data.pendingTests);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response.data.message || e.message);
        }
    }

    const getWaitingResults = async () => {
        try {
            const { data } = await axios.get(`${backendTestingStaffUrl}/waiting-results`, { headers: { tToken } });
            if (data.success) {
                setWaitingResults(data.waitingResults);
                console.log(data.waitingResults);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response.data.message || e.message);
        }
    }

    const value = {
        backendTestingStaffUrl,
        tToken,
        setTToken,
        medicalTests,
        getAllMedicalTests,
        pendingTests,
        getPendingTests,
        profileData,
        setProfileData,
        waitingResults,
        getWaitingResults
    };

    return (
        <TestingStaffContext.Provider value={value}>
            {children}
        </TestingStaffContext.Provider>
    )
}

export default TestingStaffContextProvider