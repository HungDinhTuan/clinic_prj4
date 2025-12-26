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

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === 'Login') {
        const { data } = await axios.post(`${backendURL}/user/login`, { email, password });
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
    if(token){
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      navigate(redirectPath, { replace: true });
      localStorage.removeItem('redirectAfterLogin');
    }
  }, [token, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'login'} to book an appointment.</p>
        {
          state === 'Sign Up' &&
          <div className='w-full'>
            <p>Full Name</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        }
        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className='w-full'>
          <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base cursor-pointer'>{state === 'Sign Up' ? 'Create Account' : 'login'}</button>
        </div>
        {
          state === 'Sign Up' ?
            <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login</span></p>
            :
            <p>Don't have an account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Sign Up</span></p>
        }
      </div>
    </form>
  )
}

export default Login
