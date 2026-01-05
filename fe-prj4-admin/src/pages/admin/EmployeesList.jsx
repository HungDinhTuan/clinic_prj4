import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext';

const EmployeesList = () => {

  const { aToken, allDoctors, getAllDoctors, changeAvailability, allTestingStaffs, getAllTestingStaffs, changeAvailabilityTestingStaff } = useContext(AdminContext);
  // console.log("allDoctors", allDoctors);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
      getAllTestingStaffs();
    }
  }, [aToken])

  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 max-h-[90vh] overflow-y-auto'>
      {/* Doctors Section */}
      <div className='mb-12'>
        {/* Section Header */}
        <div className='flex items-center gap-4 mb-6'>
          <div className='h-1 flex-1 bg-gradient-to-r from-blue-200 to-transparent rounded'></div>
          <p className='text-blue-600 font-bold text-sm uppercase tracking-widest px-4 whitespace-nowrap'>
            Doctors
          </p>
          <div className='h-1 flex-1 bg-gradient-to-l from-blue-200 to-transparent rounded'></div>
        </div>

        <div className='mb-4'>
          <h2 className='text-2xl font-bold text-gray-900'>All Doctors</h2>
          <p className='text-gray-600 text-sm mt-1'>Manage doctor availability and information</p>
        </div>

        {/* Doctors Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {
            allDoctors && allDoctors.map((item, index) => (
              <div
                key={index}
                className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer'
              >
                {/* Image Container */}
                <div className='relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100'>
                  <img
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    src={item.image}
                    alt={item.name}
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300'></div>
                </div>

                {/* Content */}
                <div className='p-5'>
                  <p className='text-gray-900 text-lg font-bold line-clamp-1'>{item.name}</p>
                  <p className='text-blue-600 text-sm font-medium mt-1'>{item.speciality}</p>

                  {/* Availability Toggle */}
                  <div className='mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors'>
                    <input
                      onChange={() => changeAvailability(item._id)}
                      type="checkbox"
                      checked={item.available}
                      className='w-4 h-4 accent-blue-600 rounded cursor-pointer'
                    />
                    <label className='text-sm font-medium text-gray-700 cursor-pointer flex-1'>
                      {item.available ? 'Available' : 'Unavailable'}
                    </label>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Testing Staffs Section */}
      <div className='mt-16'>
        {/* Section Header */}
        <div className='flex items-center gap-4 mb-6'>
          <div className='h-1 flex-1 bg-gradient-to-r from-purple-200 to-transparent rounded'></div>
          <p className='text-purple-600 font-bold text-sm uppercase tracking-widest px-4 whitespace-nowrap'>
            Testing Staffs
          </p>
          <div className='h-1 flex-1 bg-gradient-to-l from-purple-200 to-transparent rounded'></div>
        </div>

        <div className='mb-4'>
          <h2 className='text-2xl font-bold text-gray-900'>All Testing Staffs</h2>
          <p className='text-gray-600 text-sm mt-1'>Manage testing staff availability and information</p>
        </div>

        {/* Testing Staffs Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {
            allTestingStaffs && allTestingStaffs.map((item, index) => (
              <div
                key={index}
                className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer'
              >
                {/* Image Container */}
                <div className='relative h-48 overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100'>
                  <img
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    src={item.image}
                    alt={item.name}
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300'></div>
                </div>

                {/* Content */}
                <div className='p-5'>
                  <p className='text-gray-900 text-lg font-bold line-clamp-1'>{item.name}</p>
                  <p className='text-purple-600 text-sm font-medium mt-1'>{item.department}</p>

                  {/* Availability Toggle */}
                  <div className='mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 transition-colors'>
                    <input
                      onChange={() => changeAvailabilityTestingStaff(item._id)}
                      type="checkbox"
                      checked={item.available}
                      className='w-4 h-4 accent-purple-600 rounded cursor-pointer'
                    />
                    <label className='text-sm font-medium text-gray-700 cursor-pointer flex-1'>
                      {item.available ? 'Available' : 'Unavailable'}
                    </label>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default EmployeesList