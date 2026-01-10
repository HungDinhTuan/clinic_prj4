import { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctorContext.jsx';
import { TestingStaffContext } from '../context/TestingStaffContext.jsx';
import { NurseContext } from '../context/NurseContext.jsx';

const Login = () => {

  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken, backendDocUrl } = useContext(DoctorContext);
  const { setTToken, backendTestingStaffUrl } = useContext(TestingStaffContext);
  const { setNToken, backendNurseUrl } = useContext(NurseContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/login`, { email, password });
        if (data.success) {
          localStorage.setItem('aToken', data.token);
          setAToken(data.token);
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Doctor') {
        const { data } = await axios.post(`${backendDocUrl}/login`, { email, password });
        if (data.success) {
          localStorage.setItem('dToken', data.token);
          setDToken(data.token);
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Testing Staff') {
        const { data } = await axios.post(`${backendTestingStaffUrl}/login`, { email, password });
        if (data.success) {
          localStorage.setItem('tToken', data.token);
          setTToken(data.token);
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Nurse') {
        const { data } = await axios.post(`${backendNurseUrl}/login`, { email, password });
        if (data.success) {
          localStorage.setItem('nToken', data.token);
          setNToken(data.token);
        } else {
          toast.error(data.message)
        }
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        toast.error(e.response.data.message);
      } else {
        // toast.error("Something went wrong.");
      }
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8'>
      <div className='w-full max-w-md'>
        {/* Main Card */}
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100'>
          {/* Header Section */}
          <div className='bg-gradient-to-r from-primary to-primary/80 px-8 py-8 text-white'>
            <h1 className='text-3xl font-bold'>
              <span className='block text-white'>{state}</span>
              <span className='block text-white/90 text-lg font-semibold mt-1'>Login Portal</span>
            </h1>
            <p className='text-white/80 text-sm mt-3'>Access your dashboard securely</p>
          </div>

          {/* Form Content */}
          <div className='p-8'>
            {/* Job Position Select */}
            <div className='mb-6'>
              <label className='block text-sm font-bold text-gray-800 mb-3'>Job Position</label>
              <select
                onChange={(e) => setState(e.target.value)}
                value={state}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white font-medium text-gray-900'
              >
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Testing Staff">Testing Staff</option>
                <option value="Nurse">Nurse</option>
              </select>
            </div>

            {/* Email Input */}
            <div className='mb-6'>
              <label className='block text-sm font-bold text-gray-800 mb-3'>Email Address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-gray-900'
                type="email"
                placeholder='Enter your email'
                required
              />
            </div>

            {/* Password Input */}
            <div className='mb-8'>
              <label className='block text-sm font-bold text-gray-800 mb-3'>Password</label>
              <div className='relative'>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-gray-900'
                  type={showPassword ? "text" : "password"}
                  placeholder='Enter your password'
                  required
                />
                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors duration-200'>
                  {showPassword ? (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'></path>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'></path>
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type='submit'
              className='w-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-200 hover:from-primary/90 hover:to-primary/70 active:scale-95'
            >
              Sign In
            </button>

            {/* Footer Text */}
            <div className='mt-6 text-center'>
              <p className='text-gray-600 text-sm'>
                Change role using the dropdown above
              </p>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className='h-1 bg-gradient-to-r from-primary via-primary/50 to-primary/20'></div>
        </div>

        {/* Footer Info */}
        <div className='text-center mt-6 text-gray-600 text-sm'>
          <p>Healthcare Management System</p>
          <p className='text-gray-500 mt-1'>Secure Login Portal</p>
        </div>
      </div>
    </form>
  )
}

export default Login
