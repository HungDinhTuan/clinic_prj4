import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext';

const EmployeesList = () => {

  const { aToken, allDoctors, getAllDoctors, changeAvailability, allTestingStaffs, getAllTestingStaffs, allNurses, getAllNurses, changeAvailabilityTestingStaff } = useContext(AdminContext);
  const [activeTab, setActiveTab] = useState('doctors');

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
      getAllTestingStaffs();
      getAllNurses();
    }
  }, [aToken])

  const EmployeeCard = ({ item, type, onAvailabilityChange }) => (
    <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group'>
      {/* Image Container */}
      <div className='relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200'>
        <img
          className='w-full h-full object-cover group-hover:scale-125 transition-transform duration-700'
          src={item.image}
          alt={item.name}
        />
        {/* Overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

        {/* Status Badge */}
        <div className='absolute top-4 right-4'>
          <div className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm ${item.available
              ? 'bg-green-400/90 text-green-900'
              : 'bg-red-400/90 text-red-900'
            }`}>
            {item.available ? '● Online' : '● Offline'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Name and Title */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold text-gray-900 line-clamp-2'>{item.name}</h3>
          <p className={`text-sm font-semibold mt-2 ${type === 'doctor' ? 'text-blue-600' :
              type === 'testing' ? 'text-purple-600' :
                'text-green-600'
            }`}>
            {type === 'doctor' ? item.speciality : type === 'testing' ? item.department : item.speciality}
          </p>
          {item.degree && (
            <p className='text-xs text-gray-500 mt-1'>{item.degree}</p>
          )}
        </div>

        {/* Divider */}
        <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4'></div>

        {/* Availability Toggle */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-semibold text-gray-700'>Availability</span>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={item.available}
              onChange={() => onAvailabilityChange(item._id)}
              className='sr-only peer'
            />
            <div className={`w-11 h-6 rounded-full transition-all duration-300 ${item.available
                ? 'bg-green-500 shadow-lg shadow-green-500/50'
                : 'bg-gray-300'
              } peer-checked:bg-green-500 peer-checked:shadow-lg peer-checked:shadow-green-500/50`}></div>
            <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${item.available ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
          </label>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, icon, color }) => (
    <div className='mb-10'>
      <div className='flex items-center gap-4 mb-6'>
        <div className={`w-12 h-12 rounded-xl ${color === 'blue' ? 'bg-blue-100' :
            color === 'purple' ? 'bg-purple-100' :
              'bg-green-100'
          } flex items-center justify-center`}>
          <span className={`text-lg ${color === 'blue' ? 'text-blue-600' :
              color === 'purple' ? 'text-purple-600' :
                'text-green-600'
            }`}>{icon}</span>
        </div>
        <div>
          <h2 className='text-3xl font-bold text-gray-900'>{title}</h2>
          <p className='text-gray-500 text-sm mt-1'>{subtitle}</p>
        </div>
      </div>
    </div>
  );

  const renderSection = (data, title, subtitle, icon, color, type, changeFunc) => (
    <div className='mb-16'>
      <SectionHeader title={title} subtitle={subtitle} icon={icon} color={color} />

      {data && data.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {data.map((item, index) => (
            <EmployeeCard
              key={index}
              item={item}
              type={type}
              onAvailabilityChange={changeFunc}
            />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <div className='w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
            <span className='text-3xl'>{icon}</span>
          </div>
          <p className='text-gray-600 font-semibold text-lg'>No {title.toLowerCase()} found</p>
          <p className='text-gray-400 text-sm mt-2'>Start by adding your first {title.toLowerCase()}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className='w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12'>
        {/* Page Header */}
        <div className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-3'>Employees Management</h1>
          <p className='text-gray-600 text-lg'>Manage all your staff members and their availability status</p>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12'>
          <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-600 font-semibold text-sm'>Total Doctors</p>
                <p className='text-3xl font-bold text-blue-900 mt-2'>{allDoctors?.length || 0}</p>
              </div>
              <div className='w-16 h-16 bg-blue-200/50 rounded-xl flex items-center justify-center text-2xl'>👨‍⚕️</div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-600 font-semibold text-sm'>Testing Staff</p>
                <p className='text-3xl font-bold text-purple-900 mt-2'>{allTestingStaffs?.length || 0}</p>
              </div>
              <div className='w-16 h-16 bg-purple-200/50 rounded-xl flex items-center justify-center text-2xl'>🧪</div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-600 font-semibold text-sm'>Total Nurses</p>
                <p className='text-3xl font-bold text-green-900 mt-2'>{allNurses?.length || 0}</p>
              </div>
              <div className='w-16 h-16 bg-green-200/50 rounded-xl flex items-center justify-center text-2xl'>👩‍⚕️</div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className='space-y-16'>
          {renderSection(
            allDoctors,
            'Doctors',
            'Manage doctor availability and specialties',
            '👨‍⚕️',
            'blue',
            'doctor',
            changeAvailability
          )}

          {renderSection(
            allTestingStaffs,
            'Testing Staff',
            'Manage testing staff and departments',
            '🧪',
            'purple',
            'testing',
            changeAvailabilityTestingStaff
          )}

          {renderSection(
            allNurses,
            'Nurses',
            'Manage nurse availability and specialties',
            '👩‍⚕️',
            'green',
            'nurse',
            changeAvailability
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeesList