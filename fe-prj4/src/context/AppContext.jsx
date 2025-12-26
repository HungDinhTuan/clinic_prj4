import { createContext } from "react";
import axios from 'axios';
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

    const backendURL = import.meta.env.VITE_BACKEND_URL;
    
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false );
    const [userData, setUserData] = useState(false);

    const getDoctorsData = async () => {
        try{
            const {data} = await axios.get(`${backendURL}/doctor/list`);
            
            if(data.success){
                setDoctors(data.doctors);
            }else{
                toast.error(data.message);
            }
        }catch(e){
            console.log(e);
            toast.error(e.response.data.message);
        }
    }

    const loadUserProfileData = async () => {
        try{
            const {data} = await axios.get(`${backendURL}/user/get-profile`, {headers : {token}});
            if(data.success){
                setUserData(data.userData);
            }else{
                toast.error(data.message);
            }
        }catch(e){
            console.log(e);
            toast.error(e.response.data.message);
        }
    }
    
    const value = {
        doctors,
        getDoctorsData,
        token,
        setToken,
        backendURL,
        userData,
        setUserData,
        loadUserProfileData
    };

    useEffect(() =>{
        getDoctorsData();
    }, [])

    useEffect(() => {
        if(token){
            loadUserProfileData();
        }else{
            setUserData(false);
        }
    }, [token]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;
