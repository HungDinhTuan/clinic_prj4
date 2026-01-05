import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets_admin/assets.js'
import { AppContext } from '../../context/AppContext.jsx';

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  const [showConfrim, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return dashData && (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>Dashboard</h1>
        <p className='text-gray-600'>Welcome back! Here's your system overview.</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {/* Doctors Card */}
        <div className='bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-indigo-200 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.doctor_icon} alt="Doctors" />
            </div>
            <span className='text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full'>Active</span>
          </div>
          <p className='text-gray-600 text-sm font-medium mb-1'>Doctors</p>
          <p className='text-2xl font-bold text-gray-900'>{dashData.doctors}</p>
        </div>

        {/* Appointments Card */}
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-blue-200 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.appointments_icon} alt="Appointments" />
            </div>
            <span className='text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full'>Total</span>
          </div>
          <p className='text-gray-600 text-sm font-medium mb-1'>Appointments</p>
          <p className='text-2xl font-bold text-gray-900'>{dashData.appointments}</p>
        </div>

        {/* Patients Card */}
        <div className='bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200 p-6 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-cyan-200 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.patients_icon} alt="Patients" />
            </div>
            <span className='text-xs font-semibold text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full'>Registered</span>
          </div>
          <p className='text-gray-600 text-sm font-medium mb-1'>Patients</p>
          <p className='text-2xl font-bold text-gray-900'>{dashData.users}</p>
        </div>
      </div>

      {/* Latest Bookings Section */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 px-6 py-5 bg-gray-50 border-b border-gray-200'>
          <div className='bg-blue-100 rounded-lg p-2'>
            <img className='w-5 h-5' src={assets.list_icon} alt="" />
          </div>
          <div>
            <p className='font-bold text-gray-900'>Latest Appointments</p>
            <p className='text-xs text-gray-600 mt-0.5'>Recent bookings and payment status</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className='divide-y divide-gray-100'>
          {dashData.lastestAppointments && dashData.lastestAppointments.length > 0 ? (
            dashData.lastestAppointments.map((item, index) => (
              <div
                className='flex items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-150'
                key={index}
              >
                <img
                  className='w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 mr-4'
                  src={item.docData.image}
                  alt={item.docData.name}
                />
                <div className='flex-1 min-w-0'>
                  <p className='text-gray-900 font-semibold text-sm'>{item.docData.name}</p>
                  <p className='text-gray-600 text-xs mt-1'>{slotDateFormat(item.slotDate)}</p>
                </div>
                <div className='flex items-center gap-3 ml-4'>
                  {
                    item.payment ? (
                      <div className='flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full'>
                        <span className='text-green-600 text-xs font-semibold'>✓ Paid</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedId(item._id); setShowConfirm(true); }}
                        className='p-2 hover:bg-red-100 rounded-lg transition-colors duration-150'
                        title='Cancel appointment'
                      >
                        <img
                          src={assets.cancel_icon}
                          alt="Cancel"
                          className='w-5 h-5 cursor-pointer'
                        />
                      </button>
                    )
                  }
                </div>
              </div>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
              <p className='text-sm font-medium'>No appointments</p>
              <p className='text-xs'>Waiting for bookings...</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfrim && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-fadeIn'>
            <div className='mb-6'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <span className='text-xl'>⚠️</span>
              </div>
              <h2 className='text-xl font-bold text-gray-900'>Cancel Appointment?</h2>
              <p className='text-gray-600 text-sm mt-2'>
                This action cannot be undone. Both doctor and patient will be notified.
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                className='flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all'
                onClick={() => setShowConfirm(false)}
              >
                Keep Appointment
              </button>
              <button
                className='flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-sm hover:shadow-md'
                onClick={() => { cancelAppointment(selectedId); setShowConfirm(false); }}
              >
                Cancel Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard