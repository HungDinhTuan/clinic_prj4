import axios from 'axios';
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const TestingStaffContext = createContext();

const TestingStaffContextProvider = ({ children }) => {

    const backendTestingStaffUrl = import.meta.env.VITE_BACKEND_TESTING_STAFF_URL;

    const [tToken, setTToken] = useState(localStorage.getItem('tToken') ? localStorage.getItem('tToken') : '');
    const [pendingTests, setPendingTests] = useState([]);
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
            const { data } = await axios.get(`${backendUrl}/testing-staff/pending-tests`, { headers: { sToken } });
            if (data.success) {
                setPendingTests(data.pendingTests);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || e.message);
        }
    };

    const updateTestResult = async (recordId, testId, formData) => {
        try {
            const { data } = await axios.put(`${backendUrl}/testing-staff/update-test/${recordId}/${testId}`, formData, { headers: { sToken, 'Content-Type': 'multipart/form-data' } });
            if (data.success) {
                toast.success(data.message);
                getPendingTests();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || e.message);
        }
    };

    const value = {
        backendTestingStaffUrl,
        tToken,
        setTToken,
        pendingTests,
        getPendingTests,
        updateTestResult,
        medicalTests,
        getAllMedicalTests
    };

    return (
        <TestingStaffContext.Provider value={value}>
            {children}
        </TestingStaffContext.Provider>
    )
}

export default TestingStaffContextProvider