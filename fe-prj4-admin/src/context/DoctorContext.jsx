import axios from "axios";
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {

  const backendDocUrl = import.meta.env.VITE_BACKEND_DOC_URL;

  const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '');
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [medicalTests, setMedicalTests] = useState([]);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendDocUrl}/appointments`, { headers: { dToken } });

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const getAllMedicines = async () => {
    try {
      const { data } = await axios.get(`${backendDocUrl}/medicines`, { headers: { dToken } });

      if (data.success) {
        setMedicines(data.medicines);
        console.log(data.medicines);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const getAllMedicalTests = async () => {
    try {
      const { data } = await axios.get(`${backendDocUrl}/medical-tests`, { headers: { dToken } });

      if (data.success) {
        setMedicalTests(data.tests);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = axios.put(`${backendDocUrl}/complete-appointment`, { appointmentId }, { headers: { dToken } });

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendDocUrl}/dashboard`, { headers: { dToken } });
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

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendDocUrl}/profile`, { headers: { dToken } });

      if (data.success) {
        setProfileData(data.docData);
        console.log(data.docData);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const value = {
    backendDocUrl,
    dToken,
    setDToken,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    medicines,
    getAllMedicines,
    medicalTests,
    getAllMedicalTests
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;