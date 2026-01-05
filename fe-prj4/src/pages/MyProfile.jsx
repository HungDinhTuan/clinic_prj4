import React, { useState } from 'react'
import { assets } from '../assets/assets_frontend/assets';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {

  const { userData, setUserData, token, backendURL, loadUserProfileData } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append('phone', userData.phone);
      formData.append('email', userData.email);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob)

      image && formData.append('image', image)

      const { data } = await axios.put(`${backendURL}/user/update-profile`, formData, { headers: { token } })

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message);
    }
  }

  return userData && (
    <div className='max-w-2xl flex flex-col gap-4 text-base pt-5'>
      {
        isEdit
          ? <label htmlFor="image">
            <div className='inline-block relative cursor-pointer group'>
              <img className='w-40 h-40 rounded-lg shadow-md object-cover opacity-75 group-hover:opacity-100 transition-opacity' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
              <img className='w-10 absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md' src={image ? " " : assets.upload_icon} />
            </div>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" name='' id='image' hidden />
          </label>
          : <img className='w-40 h-40 rounded-lg shadow-md object-cover' src={userData.image} alt="" />
      }
      <p className='font-bold text-3xl text-neutral-900 mt-6'>{userData.name}</p>
      <hr className='bg-gray-300 h-0.5 border-none my-4' />
      <div>
        <p className='text-gray-700 font-semibold uppercase tracking-wide text-sm mb-4'>📞 Contact Information</p>
        <div className='grid grid-cols-1 gap-y-4 text-neutral-700'>
          <div className='grid grid-cols-[120px_1fr] gap-4 items-center'>
            <p className='font-semibold text-gray-800'>Email</p>
            {
              isEdit
                ? <input className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white' type="text" onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))} value={userData.email} />
                : <p className='text-primary font-medium'>{userData.email}</p>
            }
          </div>
          <div className='grid grid-cols-[120px_1fr] gap-4 items-center'>
            <p className='font-semibold text-gray-800'>Phone</p>
            {
              isEdit
                ? <input className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white' type="text" value={userData.phone} onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))} />
                : <p className='text-primary font-medium'>{userData.phone}</p>
            }
          </div>
          <div className='grid grid-cols-[120px_1fr] gap-4'>
            <p className='font-semibold text-gray-800'>Address</p>
            {
              isEdit
                ? <div className='flex flex-col gap-2'>
                  <input className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white' type="text" placeholder='Street address' value={userData.address.line1} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} />
                  <input className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white' type="text" placeholder='City, province' value={userData.address.line2} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} />
                </div>
                : <p className='text-gray-600'>
                  <span className='font-medium'>{userData.address.line1}</span>
                  <br />
                  <span className='text-sm'>{userData.address.line2}</span>
                </p>
            }
          </div>
        </div>
        <div>
          <p className='text-gray-700 font-semibold uppercase tracking-wide text-sm mb-4 mt-6'>ℹ️ Basic Information</p>
          <div className='grid grid-cols-1 gap-y-4 text-neutral-700'>
            <div className='grid grid-cols-[120px_1fr] gap-4 items-center'>
              <p className='font-semibold text-gray-800'>Gender</p>
              {
                isEdit
                  ? <select className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white cursor-pointer' value={userData.gender} onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))} >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  : <p className='text-gray-600 font-medium'>{userData.gender}</p>
              }
            </div>
            <div className='grid grid-cols-[120px_1fr] gap-4 items-center'>
              <p className='font-semibold text-gray-800'>Birthday</p>
              {
                isEdit
                  ? <input className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white' type="date" value={userData.dob} onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))} />
                  : <p className='text-gray-600 font-medium'>{userData.dob}</p>
              }
            </div>
          </div>
        </div>
      </div>
      <div className='mt-10 flex gap-3'>
        {
          isEdit
            ? <>
              <button className='px-8 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md' onClick={updateUserProfileData}>✓ Save Information</button>
              <button className='px-8 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200 cursor-pointer' onClick={() => setIsEdit(false)}>✕ Cancel</button>
            </>
            : <button className='px-8 py-2.5 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer' onClick={() => setIsEdit(true)}>✏️ Edit Profile</button>
        }
      </div>
    </div>
  )
}

export default MyProfile
