import React, { useEffect, useState } from 'react'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate = useNavigate();

  const { token, setToken, backendURL } = useContext(AppContext);

  const [state, setState] = useState('Login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === 'Login') {
        const { data } = await axios.post(`${backendURL}/user/login`, { email, password, phone });
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setEmail('');
          setPassword('');
        } else {
          toast.error(data.message);
        }
      } else if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendURL}/user/register`, { name, email, password });
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setName('');
          setEmail('');
          setPassword('');
        } else {
          toast.error(data.message);
        }
      }
    } catch (e) {
      toast.error(e.response.data.message);
    }
  }

  useEffect(() => {
    if (token) {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      navigate(redirectPath, { replace: true });
      localStorage.removeItem('redirectAfterLogin');
    }
  }, [token, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center px-4'>
      <div className='flex flex-col gap-6 w-full sm:w-96 p-8 border border-gray-200 rounded-2xl text-gray-700 text-sm shadow-2xl bg-white hover:shadow-3xl transition-shadow duration-300'>
        <div>
          <p className='text-3xl font-bold text-gray-900'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
          <p className='text-gray-500 text-base mt-2'>Please {state === 'Sign Up' ? 'sign up' : 'login'} to book an appointment.</p>
        </div>
        {
          state === 'Sign Up' &&
          <div className='w-full'>
            <label className='block font-semibold text-gray-700 mb-2'>Full Name</label>
            <input className='border border-gray-300 rounded-lg w-full px-4 py-3 mt-1 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all duration-300' type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter your full name' />
          </div>
        }
        <div className='w-full'>
          <label className='block font-semibold text-gray-700 mb-2'>Email</label>
          <input className='border border-gray-300 rounded-lg w-full px-4 py-3 mt-1 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all duration-300' type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email' />
        </div>
        {
          state === 'Sign Up' &&
          <div className='w-full'>
            <label className='block font-semibold text-gray-700 mb-2'>Phone Number</label>
            <input className='border border-gray-300 rounded-lg w-full px-4 py-3 mt-1 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all duration-300' type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='Enter your phone number' />
          </div>
        }
        <div className='w-full'>
          <label className='block font-semibold text-gray-700 mb-2'>Password</label>
          <div className='relative'>
            <input className='border border-gray-300 rounded-lg w-full px-4 py-3 mt-1 pr-12 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all duration-300' type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' />
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
        <div className='w-full pt-2'>
          <button type='submit' className='bg-primary text-white w-full py-3 rounded-lg text-base font-semibold cursor-pointer shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 active:scale-95'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</button>
        </div>
        <div className='text-center'>
          {
            state === 'Sign Up' ?
              <p className='text-gray-600'>Already have an account? <span onClick={() => setState('Login')} className='text-primary font-semibold underline cursor-pointer hover:text-blue-700 transition-colors duration-300'>Login</span></p>
              :
              <p className='text-gray-600'>Don't have an account? <span onClick={() => setState('Sign Up')} className='text-primary font-semibold underline cursor-pointer hover:text-blue-700 transition-colors duration-300'>Sign Up</span></p>
          }
        </div>
      </div>
    </form>
  )
}

export default Login
