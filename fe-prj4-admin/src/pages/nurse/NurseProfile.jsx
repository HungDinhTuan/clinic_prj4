import React, { useContext, useEffect, useState } from 'react'
import { NurseContext } from '../../context/NurseContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const NurseProfile = () => {

  const { backendNurseUrl, nToken, nurseProfile, setNurseProfile, getNurseProfile } = useContext(NurseContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: nurseProfile.address,
        available: nurseProfile.available
      }
      const { data } = await axios.put(`${backendNurseUrl}/update-nurse-profile`, updateData, { headers: { nToken } });

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getNurseProfile();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while updating the profile.");
    }
  }

  useEffect(() => {
    if (nToken) {
      getNurseProfile();
    }
  }, [nToken])

  return nurseProfile && (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>Nurse Profile</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>Manage your profile information and availability</p>
        </div>

        {/* Profile Card */}
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800'>
          {/* Top Section with Image and Basic Info */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 p-8'>
            {/* Profile Image */}
            <div className='md:col-span-1 flex flex-col items-center'>
              <div className='w-full aspect-square overflow-hidden rounded-xl mb-6 shadow-lg dark:shadow-xl'>
                <img
                  className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                  src={nurseProfile.image}
                  alt={nurseProfile.name}
                />
              </div>
              <div className='w-full space-y-2 text-center'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>{nurseProfile.name}</h2>
                <p className='text-primary dark:text-blue-400 font-semibold'>{nurseProfile.department}</p>
                <p className='text-gray-600 dark:text-gray-400 text-sm'>{nurseProfile.qualification}</p>
                <p className='text-gray-600 dark:text-gray-400 text-sm'>{nurseProfile.email}</p>
              </div>
            </div>

            {/* Info Section */}
            <div className='md:col-span-2 space-y-6'>
              {/* Experience */}
              <div>
                <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800'>
                  <p className='text-gray-600 dark:text-gray-400 text-sm font-medium'>Experience</p>
                  <p className='text-2xl font-bold text-primary dark:text-blue-400 mt-1'>{nurseProfile.experience}</p>
                </div>
              </div>

              {/* About */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>About</label>
                <p className='text-gray-700 dark:text-gray-300 leading-relaxed text-base'>
                  {nurseProfile.about}
                </p>
              </div>

              {/* Availability Status */}
              <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
                <input
                  onChange={() => isEdit && setNurseProfile(prev => ({ ...prev, available: !prev.available }))}
                  checked={nurseProfile.available}
                  className='w-5 h-5 cursor-pointer accent-primary rounded'
                  type="checkbox"
                />
                <label className='cursor-pointer flex flex-col'>
                  <span className='font-medium text-gray-900 dark:text-white'>Availability Status</span>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {nurseProfile.available ? '✓ Currently Available' : '✗ Not Available'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className='border-t border-gray-100 dark:border-gray-800 px-8 py-8'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Address Information</h3>
              {!isEdit && (
                <button
                  onClick={() => setIsEdit(true)}
                  className='px-6 py-2.5 bg-primary dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-opacity-90 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md'
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className='space-y-4'>
              {/* Address Line 1 */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>Street Address</label>
                {isEdit ? (
                  <input
                    type="text"
                    onChange={(e) => setNurseProfile(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    value={nurseProfile.address.line1}
                    className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-primary dark:focus:border-blue-400 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-400/20 transition-all'
                    placeholder='Enter street address'
                  />
                ) : (
                  <p className='px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-medium'>
                    {nurseProfile.address.line1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>City/District</label>
                {isEdit ? (
                  <input
                    type="text"
                    onChange={(e) => setNurseProfile(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                    value={nurseProfile.address.line2}
                    className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-primary dark:focus:border-blue-400 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-400/20 transition-all'
                    placeholder='Enter city/district'
                  />
                ) : (
                  <p className='px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-medium'>
                    {nurseProfile.address.line2}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEdit && (
              <div className='flex gap-3 mt-8 justify-end'>
                <button
                  onClick={() => setIsEdit(false)}
                  className='px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setIsEdit(false), updateProfile() }}
                  className='px-6 py-2.5 bg-primary dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-opacity-90 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md'
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NurseProfile