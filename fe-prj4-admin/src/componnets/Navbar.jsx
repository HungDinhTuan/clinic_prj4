import { useContext } from 'react'
import { assets } from '../assets/assets_admin/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { TestingStaffContext } from '../context/TestingStaffContext';

const Navbar = () => {

    const { aToken, setAToken } = useContext(AdminContext);
    const { dToken, setDToken } = useContext(DoctorContext);
    const { tToken, setTToken } = useContext(TestingStaffContext);

    const navigate = useNavigate();

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
            <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full cursor-pointer'>Logout</button>
        </div>
    )
}

export default Navbar
