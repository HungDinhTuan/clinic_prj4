import { useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { useEffect } from 'react';
import { useState } from 'react';
import { assets } from '../../assets/assets_admin/assets';
import { AppContext } from '../../context/AppContext';
import { NumericFormat } from 'react-number-format';

const DoctorDashboard = () => {

  const { dToken, dashData, setDashData, getDashData, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);

  const [showConfrim, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);
  return dashData && (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 dark:bg-gray-950 min-h-screen'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2'>Dashboard</h1>
        <p className='text-gray-600 dark:text-gray-400'>Welcome back! Here's your performance overview.</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {/* Earnings Card */}
        <div className='bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-blue-200 dark:bg-blue-700 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.earning_icon} alt="Earnings" />
            </div>
            <span className='text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full'>Total</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Earnings</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>
            <NumericFormat
              value={dashData.earnings}
              thousandSeparator="."
              decimalSeparator=","
              displayType="text"
              decimalScale={3}
            /> VND
          </p>
        </div>

        {/* Appointments Card */}
        <div className='bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-green-200 dark:bg-green-700 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.appointments_icon} alt="Appointments" />
            </div>
            <span className='text-xs font-semibold text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full'>This Month</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Appointments</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{dashData.appointments}</p>
        </div>

        {/* Patients Card */}
        <div className='bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-purple-200 dark:bg-purple-700 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.patients_icon} alt="Patients" />
            </div>
            <span className='text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full'>Active</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Patients</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{dashData.patients}</p>
        </div>
      </div>

      {/* Latest Bookings Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 px-6 py-5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
          <div className='bg-blue-100 dark:bg-blue-900/50 rounded-lg p-2'>
            <img className='w-5 h-5' src={assets.list_icon} alt="" />
          </div>
          <div>
            <p className='font-bold text-gray-900 dark:text-white'>Latest Appointments</p>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-0.5'>Recent bookings and payment status</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {dashData.lastestAppointments && dashData.lastestAppointments.length > 0 ? (
            dashData.lastestAppointments.map((item, index) => (
              <div
                className='flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150'
                key={index}
              >
                <img
                  className='w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 mr-4'
                  src={item.userData.image}
                  alt={item.userData.name}
                />
                <div className='flex-1 min-w-0'>
                  <p className='text-gray-900 dark:text-white font-semibold text-sm'>{item.userData.name}</p>
                  <p className='text-gray-600 dark:text-gray-400 text-xs mt-1'>{slotDateFormat(item.slotDate)}</p>
                </div>
                <div className='flex items-center gap-3 ml-4'>
                  {
                    item.payment ? (
                      <div className='flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full'>
                        <span className='text-green-600 dark:text-green-400 text-xs font-semibold'>✓ Paid</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedId(item._id); setShowConfirm(true); }}
                        className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150'
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
            <div className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
              <p className='text-sm font-medium'>No appointments</p>
              <p className='text-xs'>Waiting for bookings...</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfrim && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl dark:shadow-2xl animate-fadeIn border border-gray-200 dark:border-gray-800'>
            <div className='mb-6'>
              <div className='w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4'>
                <span className='text-xl'>⚠️</span>
              </div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Cancel Appointment?</h2>
              <p className='text-gray-600 dark:text-gray-400 text-sm mt-2'>
                This action cannot be undone. The patient will be notified about the cancellation.
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                className='flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
                onClick={() => setShowConfirm(false)}
              >
                Keep Appointment
              </button>
              <button
                className='flex-1 px-4 py-2.5 rounded-lg bg-red-600 dark:bg-red-700 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-all shadow-sm hover:shadow-md'
                onClick={() => { completeAppointment(selectedId); setShowConfirm(false); }}
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

export default DoctorDashboard