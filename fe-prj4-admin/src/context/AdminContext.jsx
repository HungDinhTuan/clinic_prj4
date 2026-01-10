import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {

  const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');
  const [adminName, setAdminName] = useState('Admin');
  const [adminImage, setAdminImage] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [allTestingStaffs, setAllTestingStaffs] = useState([]);
  const [allNurses, setAllNurses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicalTests, setMedicalTests] = useState([]);
  const [dashData, setDashData] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/all-doctors`, { headers: { aToken } });
      if (data.success) {
        setAllDoctors(data.doctors);
        // console.log(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.put(`${backendUrl}/change-availability-doctor`, { docId }, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/appointments`, { headers: { aToken } });

      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);

      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.put(`${backendUrl}/cancel-appointment`, { appointmentId }, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/dashboard`, { headers: { aToken } });

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

  const getAllMedicines = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/medicines`, { headers: { aToken } });

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
      const { data } = await axios.get(`${backendUrl}/medical-tests`, { headers: { aToken } });

      if (data.success) {
        setMedicalTests(data.tests);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const getAllTestingStaffs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/all-testing-staffs`, { headers: { aToken } });
      if (data.success) {
        setAllTestingStaffs(data.testingStaffs);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  };

  const getAllNurses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/all-nurses`, { headers: { aToken } });
      if (data.success) {
        setAllNurses(data.nurses);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  };

  const changeAvailabilityTestingStaff = async (testingStaffId) => {
    try {
      const { data } = await axios.put(`${backendUrl}/change-availability-testing-staff`, { testingStaffId }, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        getAllTestingStaffs();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const value = {
    aToken,
    setAToken,
    adminName,
    setAdminName,
    adminImage,
    setAdminImage,
    backendUrl,
    allDoctors,
    getAllDoctors,
    changeAvailability,
    allTestingStaffs,
    getAllTestingStaffs,
    allNurses,
    getAllNurses,
    changeAvailabilityTestingStaff,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    medicines,
    getAllMedicines,
    medicalTests,
    getAllMedicalTests
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;