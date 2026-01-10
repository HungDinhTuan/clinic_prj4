import axios from 'axios';
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const TestingStaffContext = createContext();

const TestingStaffContextProvider = ({ children }) => {

    const backendTestingStaffUrl = import.meta.env.VITE_BACKEND_TESTING_STAFF_URL;

    const [tToken, setTToken] = useState(localStorage.getItem('tToken') ? localStorage.getItem('tToken') : '');
    const [pendingTests, setPendingTests] = useState([]);
    const [waitingResults, setWaitingResults] = useState([]);
    const [testingStaffProfile, setTestingStaffProfile] = useState(false);
    const [medicalTests, setMedicalTests] = useState([]);
    const [dashData, setDashData] = useState(false);

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

    const getWaitingResults = async (status = 'in-progress') => {
        try {
            let url = `${backendTestingStaffUrl}/waiting-results`;
            if (status) {
                url += `?status=${status}`;
            }
            const { data } = await axios.get(url, { headers: { tToken } });
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

    const getTestingStaffProfile = async () => {
        try {
            const { data } = await axios.get(`${backendTestingStaffUrl}/profile`, { headers: { tToken } });
            if (data.success) {
                setTestingStaffProfile(data.testingStaffData);
                console.log(data.testingStaffData);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response.data.message || e.message);
        }
    }

    const getTestingStaffDashData = async () => {
        try {
            const { data } = await axios.get(`${backendTestingStaffUrl}/dashboard`, { headers: { tToken } });
            if (data.success) {
                setDashData(data.dashData);
                console.log(data.dashData);
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
        testingStaffProfile,
        getTestingStaffProfile,
        setTestingStaffProfile,
        dashData,
        setDashData,
        getTestingStaffDashData,
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