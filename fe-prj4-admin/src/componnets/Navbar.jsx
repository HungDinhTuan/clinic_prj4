import { useContext } from 'react'
import { assets } from '../assets/assets_admin/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { TestingStaffContext } from '../context/TestingStaffContext';
import { useState } from 'react';

const Navbar = () => {

    const { aToken, setAToken } = useContext(AdminContext);
    const { dToken, setDToken } = useContext(DoctorContext);
    const { tToken, setTToken } = useContext(TestingStaffContext);

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const logout = () => {
        navigate('/');
        if (aToken) {
            aToken && setAToken('');
            aToken && localStorage.removeItem('aToken');
        } else if (dToken) {
            dToken && setDToken('');
            dToken && localStorage.removeItem('dToken');
        } else if (tToken) {
            tToken && setTToken('');
            tToken && localStorage.removeItem('tToken');
        }
    }

    return (
        <div className='flex justify-between items-center px-4 sm:py-10 border-b bg-white'>
            <div className='flex items-center px-10 gap-2 text-xs'>
                <img className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo1} alt="" />
                <p className='border px-2.5 py-0.5 rounded-full border-primary text-primary'>{aToken ? 'Admin' : dToken ? 'Doctor' : 'Testing Staff'}</p>
            </div>
            <div className='flex items-center gap-4'>
                {/* Search Box */}
                <div className='hidden sm:flex items-center border rounded-lg px-3 py-2 bg-gray-100'>
                    <input
                        type="text"
                        placeholder='Search...'
                        className='outline-none bg-gray-100 text-sm w-48'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <img className='w-4 h-4 cursor-pointer' src={assets.search_icon} alt="search" />
                </div>

                {/* Notification Bell */}
                <div className='relative cursor-pointer'>
                    <img className='w-5 h-5' src={assets.bell_icon} alt="notifications" />
                    <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>0</span>
                </div>

                {/* Logout Button */}
                <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full cursor-pointer'>Logout</button>
            </div>
        </div>
    )
}

export default Navbar
