import axios from "axios";
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const NurseContext = createContext();

const NurseContextProvider = ({ children }) => {
    
    const backendNurseUrl = import.meta.env.VITE_BACKEND_NURSE_URL;

    const [nToken, setNToken] = useState(localStorage.getItem('nToken') ? localStorage.getItem('nToken') : '');
    const [nurseProfile, setNurseProfile] = useState(false);
    const [doctorsList, setDoctorsList] = useState([]);
    const [dashData, setDashData] = useState(false);

    const getDoctorsByNurseCategory = async () => {
        try {
            const {data} = await axios.get(`${backendNurseUrl}/list-doctors`, { headers: { nToken } });
            if (data?.success) {
                setDoctorsList(data.doctors);
            }else {
                toast.error(data.message);
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || e.message);
        }
    }

    const values = {
        backendNurseUrl,
        nToken,
        doctorsList,
        getDoctorsByNurseCategory
    };

    return (
        <NurseContext.Provider value={values}>
            {children}
        </NurseContext.Provider>
    )
}

export default NurseContextProvider;