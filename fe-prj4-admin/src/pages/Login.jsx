import { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctorContext.jsx';
import { TestingStaffContext } from '../context/TestingStaffContext.jsx';

const Login = () => {

  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken, backendDocUrl } = useContext(DoctorContext);
  const { setTToken, backendTestingStaffUrl } = useContext(TestingStaffContext);

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
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state} </span>Login</p>
        <div className='w-full'>
          <p>Job Position</p>
          <select onChange={(e) => setState(e.target.value)} name="" id="" className='border border-[#DADADA] rounded w-full p-2 mt-1'>
            <option value="Admin">Admin</option>
            <option value="Doctor">Doctor</option>
            <option value="Testing Staff">Testing Staff</option>
          </select>
        </div>
        <div className='w-full'>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        <button className='bg-primary text-white rounded-md w-full py-2 text-base cursor-pointer'>Login</button>
        {/* {
          state === 'Admin'
            ? <p>Doctor Login? <span className='cursor-pointer underline text-primary' onClick={() => setState('Doctor')}>Click here.</span></p>
            : <p>Admin Login? <span className='cursor-pointer underline text-primary' onClick={() => setState('Admin')}>Click here.</span></p>
        } */}
      </div>
    </form>
  )
}

export default Login
