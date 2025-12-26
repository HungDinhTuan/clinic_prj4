import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets_admin/assets.js';
import { DoctorContext } from '../context/DoctorContext.jsx';
import { TestingStaffContext } from '../context/TestingStaffContext.jsx';

const Sidebar = () => {

  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { tToken } = useContext(TestingStaffContext);

  return (
    <div className='w-64 bg-white border-r h-auto sticky top-0 self-stretch'>
      {
        aToken && <ul className='text-[#515151] mt-5'>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/admin-dashboard'}>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/all-appointments'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>Appointments</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/add-employee'}>
            <img src={assets.add_icon} alt="" />
            <p className='hidden md:block'>Add Employee</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/employees-list'}>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>Employees List</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/medicines'}>
            <img src={assets.medicines_icon} alt="" />
            <p className='hidden md:block'>Medicines</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/medical-tests'}>
            <img src={assets.medical_test_icon} alt="" />
            <p className='hidden md:block'>Medical Tests</p>
          </NavLink>
        </ul>
      }
      {
        dToken && <ul className='text-[#515151] mt-5'>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/doctor-dashboard'}>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/doctor-appointments'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>Appointments</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/doctor-profile'}>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>Profile</p>
          </NavLink>
        </ul>
      }
      {
        tToken && <ul className='text-[#515151] mt-5'>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/testing-staff-dashboard'}>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/testing-staff-medical-test'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>Medical Test</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-6 cursor-pointer
     ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""}`
          } to={'/testing-staff-profile'}>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>Profile</p>
          </NavLink>
        </ul>
      }
    </div>
  )
}

export default Sidebar
