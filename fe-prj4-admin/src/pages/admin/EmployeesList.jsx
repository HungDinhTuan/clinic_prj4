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
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      {/* ===== Divider: Doctors ===== */}
      <div className='flex items-center gap-4 mt-2'>
        <div className='h-px flex-1 bg-indigo-200'></div>
        <p className='text-indigo-600 font-medium text-sm uppercase tracking-wide'>
          Doctors
        </p>
        <div className='h-px flex-1 bg-indigo-200'></div>
      </div>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          allDoctors.map((item, index) => (
            <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
              <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt={item.name} />
              <div className='p-4'>
                <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                <p className='text-zinc-600 text-sm'>{item.speciality}</p>
                <div className='mt-2 flex items-center gap-1 text-sm'>
                  <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      {/* ===== Divider: Testing Staffs ===== */}
      <div className='flex items-center gap-4 mt-10'>
        <div className='h-px flex-1 bg-indigo-200'></div>
        <p className='text-indigo-600 font-medium text-sm uppercase tracking-wide'>
          Testing Staffs
        </p>
        <div className='h-px flex-1 bg-indigo-200'></div>
      </div>
      <h1 className='text-lg font-medium'>All Testing Staffs</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          allTestingStaffs.map((item, index) => (
            <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
              <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt={item.name} />
              <div className='p-4'>
                <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                <p className='text-zinc-600 text-sm'>{item.department}</p>
                <div className='mt-2 flex items-center gap-1 text-sm'>
                  <input onChange={() => changeAvailabilityTestingStaff(item._id)} type="checkbox" checked={item.available} />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default EmployeesList