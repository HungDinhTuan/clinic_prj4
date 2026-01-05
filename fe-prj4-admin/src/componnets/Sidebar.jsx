import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets_admin/assets.js';
import { DoctorContext } from '../context/DoctorContext.jsx';
import { TestingStaffContext } from '../context/TestingStaffContext.jsx';

const Sidebar = () => {

  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { tToken } = useContext(TestingStaffContext);
  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('navbarCollapsed') === 'true');

  // Listen for collapse state changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsCollapsed(localStorage.getItem('navbarCollapsed') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events from navbar
    const checkCollapsedState = setInterval(() => {
      setIsCollapsed(localStorage.getItem('navbarCollapsed') === 'true');
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkCollapsedState);
    };
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-24' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-auto sticky top-24 self-stretch shadow-sm transition-all duration-300 ease-in-out overflow-y-auto`}>
      {
        aToken && <ul className='text-gray-700 dark:text-gray-300 mt-6 space-y-1'>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/admin/dashboard'} title='Dashboard'>
            <img className='w-5 h-5' src={assets.home_icon} alt="Dashboard" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Dashboard</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/admin/all-appointments'} title='Appointments'>
            <img className='w-5 h-5' src={assets.appointment_icon} alt="Appointments" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Appointments</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/admin/add-employee'} title='Add Employee'>
            <img className='w-5 h-5' src={assets.add_icon} alt="Add Employee" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Add Employee</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/admin/employees-list'} title='Employees List'>
            <img className='w-5 h-5' src={assets.people_icon} alt="Employees List" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Employees List</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/admin/medicines'} title='Medicines'>
            <img className='w-5 h-5' src={assets.medicines_icon} alt="Medicines" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Medicines</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/admin/medical-tests'} title='Medical Tests'>
            <img className='w-5 h-5' src={assets.medical_test_icon} alt="Medical Tests" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Medical Tests</p>
          </NavLink>
        </ul>
      }
      {
        dToken && <ul className='text-gray-700 dark:text-gray-300 mt-6 space-y-1'>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/doctor/dashboard'} title='Dashboard'>
            <img className='w-5 h-5' src={assets.home_icon} alt="Dashboard" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Dashboard</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/doctor/waiting-list'} title='Waiting List'>
            <img className='w-5 h-5' src={assets.appointment_icon} alt="Waiting List" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Waiting List</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/doctor/profile'} title='Profile'>
            <img className='w-5 h-5' src={assets.people_icon} alt="Profile" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Profile</p>
          </NavLink>
        </ul>
      }
      {
        tToken && <ul className='text-gray-700 dark:text-gray-300 mt-6 space-y-1'>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/testing-staff/dashboard'} title='Dashboard'>
            <img className='w-5 h-5' src={assets.home_icon} alt="Dashboard" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Dashboard</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/testing-staff/pending-tests'} title='Pending Tests'>
            <img className='w-5 h-5' src={assets.appointment_icon} alt="Pending Tests" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Pending Tests</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/testing-staff/waiting-results'} title='Waiting Results'>
            <img className='w-5 h-5' src={assets.appointment_icon} alt="Waiting Results" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Waiting Results</p>
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-6 cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
     ${isActive ? "bg-blue-50 dark:bg-blue-900 border-r-4 border-primary text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`
          } to={'/testing-staff/profile'} title='Profile'>
            <img className='w-5 h-5' src={assets.people_icon} alt="Profile" />
            <p className={`${isCollapsed ? 'hidden' : 'block'} text-sm`}>Profile</p>
          </NavLink>
        </ul>
      }
    </div>
  )
}

export default Sidebar
