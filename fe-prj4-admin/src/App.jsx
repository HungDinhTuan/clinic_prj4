import { useContext } from 'react';
import Login from './pages/Login.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext.jsx';
import Navbar from './componnets/Navbar.jsx';
import Sidebar from './componnets/Sidebar.jsx';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/admin/Dashboard.jsx';
import AllAppointments from './pages/admin/AllAppoitments.jsx';
import AddEmployee from './pages/admin/AddEmployee.jsx';
import EmployeesList from './pages/admin/EmployeesList.jsx';
import { DoctorContext } from './context/DoctorContext.jsx';
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import DoctorWaitingList from './pages/doctor/DoctorWaitingList.jsx';
import DoctorProfile from './pages/doctor/DoctorProfile.jsx';
import Medicine from './pages/admin/Medicine.jsx';
import MedicalTest from './pages/admin/MedicalTest.jsx';
import TestingStaffDashboard from './pages/testingStaff/TestingStaffDashboard.jsx';
import TestingStaffProfile from './pages/testingStaff/TestingStaffProfile.jsx';
import { TestingStaffContext } from './context/TestingStaffContext.jsx';
import TSMedicalTest from './pages/testingStaff/TestingStaffWaitingList.jsx';
import TestingStaffWaitingResults from './pages/testingStaff/TestingStaffWaitingResults.jsx';

const App = () => {

  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { tToken } = useContext(TestingStaffContext);

  return aToken || dToken || tToken ?
    (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex min-h-[calc(100vh-80px)]'>
          <Sidebar />
          <div className='flex-1 px-6 py-6'>
            <Routes>
              {/* Admin route */}
              <Route path='/' element={<></>} />
              <Route path='/admin/dashboard' element={<Dashboard />} />
              <Route path='/admin/all-appointments' element={<AllAppointments />} />
              <Route path='/admin/add-employee' element={<AddEmployee />} />
              <Route path='/admin/employees-list' element={<EmployeesList />} />
              <Route path='/admin/medicines' element={<Medicine />} />
              <Route path='/admin/medical-tests' element={<MedicalTest />} />
              {/* Doctor route */}
              <Route path='/doctor/dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor/waiting-list' element={<DoctorWaitingList />} />
              <Route path='/doctor/profile' element={<DoctorProfile />} />
              {/* Testing staff route */}
              <Route path='/testing-staff/dashboard' element={<TestingStaffDashboard />} />
              <Route path='/testing-staff/pending-tests' element={<TSMedicalTest />} />
              <Route path='/testing-staff/waiting-results' element={<TestingStaffWaitingResults />} />
              <Route path='/testing-staff/profile' element={<TestingStaffProfile />} />
            </Routes>
          </div>
        </div>
      </div>
    ) : (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Login />
      </div>
    )
}

export default App
