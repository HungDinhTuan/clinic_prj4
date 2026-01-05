import { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets_admin/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { TestingStaffContext } from '../context/TestingStaffContext';

const Navbar = () => {

    const { aToken, setAToken, adminName, adminImage } = useContext(AdminContext);
    const { dToken, setDToken, doctorData } = useContext(DoctorContext);
    const { tToken, setTToken, staffData } = useContext(TestingStaffContext);

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDarkMode]);

    // Pass collapse state to sidebar via localStorage or context
    useEffect(() => {
        localStorage.setItem('navbarCollapsed', isNavbarCollapsed);
    }, [isNavbarCollapsed]);

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
        setShowProfileMenu(false);
    };

    const handleProfileClick = () => {
        if (aToken) {
            navigate('/admin/profile');
        } else if (dToken) {
            navigate('/doctor/profile');
        } else if (tToken) {
            navigate('/testing-staff/profile');
        }
        setShowProfileMenu(false);
    };

    const getProfileImage = () => {
        if (aToken && adminImage) return adminImage;
        if (dToken && doctorData?.image) return doctorData.image;
        if (tToken && staffData?.image) return staffData.image;
        return assets.upload_area;
    };

    const getProfileName = () => {
        if (aToken && adminName) return adminName;
        if (dToken && doctorData?.name) return doctorData.name;
        if (tToken && staffData?.name) return staffData.name;
        return 'User';
    };

    const getRoleLabel = () => {
        return aToken ? 'Admin' : dToken ? 'Doctor' : 'Testing Staff';
    };

    const getRoleShorthand = () => {
        return aToken ? 'A' : dToken ? 'D' : 'T';
    };

    return (
        <div className='flex h-24 bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm border-b border-gray-200 dark:border-gray-700'>
            {/* Logo Section - Left side with vertical divider, matches sidebar width */}
            <div className={`${isNavbarCollapsed ? 'w-24' : 'w-64'} flex items-center justify-center px-4 sm:px-6 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out`}>
                <div className='flex flex-col items-center gap-1'>
                    <img
                        className={`${isNavbarCollapsed ? 'w-8' : 'w-32 sm:w-40'} cursor-pointer hover:opacity-80 transition-all duration-300`}
                        src={isNavbarCollapsed ? assets.admin_logo_mobile : assets.admin_logo1}
                        alt="Logo"
                    />
                    {/* Role Label */}
                    <p className={`px-2 py-0.5 rounded-full border border-primary text-primary text-xs font-medium bg-blue-50 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300 ${isNavbarCollapsed ? 'text-center' : 'hidden sm:block'}`}>
                        {isNavbarCollapsed ? getRoleShorthand() : getRoleLabel()}
                    </p>
                </div>
            </div>

            {/* Main Navbar Content */}
            <div className='flex-1 flex items-center justify-between px-4 sm:px-10 gap-6'>
                {/* Left Side - Collapse Button and Search */}
                <div className='flex items-center gap-3 sm:gap-6'>
                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
                        className='p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 ease-in-out group'
                        title="Toggle Sidebar"
                    >
                        <svg className='w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clipRule='evenodd' />
                        </svg>
                    </button>

                    {/* Search Box */}
                    <div className='hidden sm:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all'>
                        <input
                            type="text"
                            placeholder='Search or type command...'
                            className='outline-none bg-transparent text-sm w-52 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <img className='w-4 h-4 cursor-pointer ml-2 opacity-60 hover:opacity-100' src={assets.search_icon} alt="search" />
                    </div>
                </div>

                {/* Right Side - Dark Mode, Notifications, Profile */}
                <div className='flex items-center gap-4 sm:gap-6'>
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200'
                        title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {isDarkMode ? (
                            <svg className='w-5 h-5 text-yellow-500' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.83-2.83a1 1 0 00-1.414 1.414l2.83 2.83a1 1 0 001.414-1.414zm2.83-2.83a1 1 0 00-1.414-1.414l-2.83 2.83a1 1 0 001.414 1.414l2.83-2.83zM13.657 13.657a1 1 0 00-1.414-1.414l-2.83 2.83a1 1 0 001.414 1.414l2.83-2.83zm2.83-2.83a1 1 0 00-1.414-1.414l-2.83 2.83a1 1 0 001.414 1.414l2.83-2.83zM9 11a1 1 0 011-1h1a1 1 0 110 2H10a1 1 0 01-1-1zm4 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM9 7a1 1 0 011-1h1a1 1 0 110 2H10a1 1 0 01-1-1z' clipRule='evenodd' />
                            </svg>
                        ) : (
                            <svg className='w-5 h-5 text-gray-600' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
                            </svg>
                        )}
                    </button>

                    {/* Notification Bell */}
                    <div className='relative cursor-pointer group'>
                        <img className='w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors' src={assets.bell_icon} alt="notifications" />
                        <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center'>0</span>
                    </div>

                    {/* Profile Dropdown */}
                    <div className='relative'>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className='flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg px-2.5 py-2.5 transition-all duration-300 ease-in-out group'
                        >
                            <img
                                src={getProfileImage()}
                                alt="Profile"
                                className='w-7 h-7 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary dark:group-hover:ring-blue-400 transition-all duration-300'
                            />
                            <span className='hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate group-hover:text-primary dark:group-hover:text-blue-300 transition-colors duration-300'>
                                {getProfileName()}
                            </span>
                        </button>

                        {/* Profile Menu Dropdown */}
                        {showProfileMenu && (
                            <div className='absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl dark:shadow-2xl z-50 overflow-hidden'>
                                <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'>
                                    <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Account</p>
                                </div>
                                <button
                                    onClick={handleProfileClick}
                                    className='w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group/item'
                                >
                                    <span className='text-lg'>👤</span>
                                    <div className='flex-1'>
                                        <p className='font-medium group-hover/item:text-primary dark:group-hover/item:text-blue-400 transition-colors'>My Profile</p>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>View and edit profile</p>
                                    </div>
                                </button>
                                <div className='border-t border-gray-100 dark:border-gray-700'></div>
                                <button
                                    onClick={logout}
                                    className='w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group/item'
                                >
                                    <span className='text-lg'>🚪</span>
                                    <div className='flex-1'>
                                        <p className='font-medium text-red-600 dark:text-red-400 group-hover/item:text-red-700 dark:group-hover/item:text-red-300 transition-colors'>Logout</p>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>Sign out of your account</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
