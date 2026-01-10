import { useState } from 'react'
import { assets } from '../assets/assets_frontend/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {

  const navigate = useNavigate();

  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <div className='sticky top-0 z-40 bg-white shadow-lg border-b-2 border-gray-100 rounded-2xl'>
      <div className='flex items-center justify-between text-sm px-4 md:px-10 py-4'>
        <img onClick={() => { navigate('/') }} className='w-44 cursor-pointer hover:opacity-80 transition-opacity duration-300' src={assets.logo1} alt="Trust Me Clinic Logo" />
        <ul className='hidden md:flex items-center gap-8 font-semibold text-base'>
          <NavLink to="/" className={({ isActive }) => `relative group py-2 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
            <li>HOME</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 absolute bottom-0' />
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => `relative group py-2 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
            <li>ALL DOCTORS</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 absolute bottom-0' />
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `relative group py-2 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
            <li>ABOUT</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 absolute bottom-0' />
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `relative group py-2 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
            <li>CONTACT</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 absolute bottom-0' />
          </NavLink>
        </ul>
        <div className='flex items-center gap-4'>
          {
            token && userData
              ? <div className='flex items-center gap-2 cursor-pointer group relative'>
                <img className='w-10 h-10 rounded-full border-2 border-primary shadow-md object-cover' src={userData.image} alt="User Avatar" />
                <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                <div className='absolute top-0 right-0 pt-16 text-base font-medium text-gray-700 z-20 hidden group-hover:block'>
                  <div className='min-w-56 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col gap-0 overflow-hidden'>
                    <p onClick={() => navigate('/my-profile')} className='px-6 py-3 hover:bg-blue-50 hover:text-primary cursor-pointer transition-colors duration-300 border-b border-gray-100'>My Profile</p>
                    <p onClick={() => navigate('/my-appointments')} className='px-6 py-3 hover:bg-blue-50 hover:text-primary cursor-pointer transition-colors duration-300 border-b border-gray-100'>My Appointments</p>
                    <p onClick={logout} className='px-6 py-3 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors duration-300'>Log out</p>
                  </div>
                </div>
              </div>
              : <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-semibold hidden md:block cursor-pointer shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 active:scale-95'>Login</button>
          }
          <img onClick={() => setShowMenu(true)} className='w-6 md:hidden cursor-pointer hover:opacity-70 transition-opacity' src={assets.menu_icon} alt="" />
          {/*-----------Hidden menu---------------- */}
          <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all duration-300 shadow-lg`}>
            <div className='flex items-center justify-between px-5 py-6 border-b border-gray-200'>
              <img className='w-36' src={assets.logo} alt="" />
              <img className='w-7 cursor-pointer hover:opacity-70 transition-opacity' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="" />
            </div>
            <ul className='flex flex-col items-center gap-0 mt-5 px-5 text-lg font-semibold'>
              <NavLink onClick={() => setShowMenu(false)} to='/' className='w-full'><p className='px-4 py-3 rounded-lg inline-block w-full text-center hover:bg-blue-50 hover:text-primary transition-colors duration-300'>HOME</p></NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctors' className='w-full'><p className='px-4 py-3 rounded-lg inline-block w-full text-center hover:bg-blue-50 hover:text-primary transition-colors duration-300'>ALL DOCTORS</p></NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/about' className='w-full'><p className='px-4 py-3 rounded-lg inline-block w-full text-center hover:bg-blue-50 hover:text-primary transition-colors duration-300'>ABOUT US</p></NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/contact' className='w-full'><p className='px-4 py-3 rounded-lg inline-block w-full text-center hover:bg-blue-50 hover:text-primary transition-colors duration-300'>CONTACT US</p></NavLink>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
