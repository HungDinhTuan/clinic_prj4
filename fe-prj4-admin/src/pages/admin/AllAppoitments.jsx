import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext';
import { NumericFormat } from 'react-number-format';
import { assets } from '../../assets/assets_admin/assets.js'
import { useState } from 'react';

const AllAppoitments = () => {

  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat } = useContext(AppContext);

  const [showConfrim, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return appointments && (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>All Appointments</h1>
        <p className='text-gray-600'>Manage and track all patient appointments</p>
      </div>

      {/* Table Container */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        {/* Table Header */}
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1.2fr_1fr] gap-1 py-4 px-6 bg-gray-50 border-b border-gray-200'>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>#</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Patient</p>
          <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Age</p>
          <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Date & Time</p>
          <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Doctor</p>
          <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Fees</p>
          <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Action</p>
        </div>

        {/* Table Body */}
        <div className='max-h-[70vh] overflow-y-auto'>
          {appointments && appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div
                key={index}
                className='flex flex-wrap justify-between max-sm:gap-3 max-sm:text-sm sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1.2fr_1fr] items-center px-6 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150'
              >
                <p className='max-sm:hidden font-semibold text-gray-600'>{index + 1}</p>

                {/* Patient */}
                <div className='flex items-center gap-3'>
                  <img className='w-10 h-10 rounded-full object-cover ring-2 ring-gray-200' src={item.userData.image} alt={item.userData.name} />
                  <p className='font-medium text-gray-900 text-sm'>{item.userData.name}</p>
                </div>

                {/* Age */}
                <p className='max-sm:hidden text-center font-medium text-gray-700'>{calculateAge(item.userData.dob)} yrs</p>

                {/* Date & Time */}
                <p className='text-center text-sm text-gray-700'>{slotDateFormat(item.slotDate)} <br className='sm:hidden' /> {item.slotTime}</p>

                {/* Doctor */}
                <div className='flex items-center gap-3 sm:justify-center'>
                  <img className='w-10 h-10 rounded-full object-cover ring-2 ring-gray-200' src={item.docData.image} alt={item.docData.name} />
                  <p className='font-medium text-gray-900 text-sm'>{item.docData.name}</p>
                </div>

                {/* Fees */}
                <p className='text-center font-semibold text-gray-900 text-sm'>
                  <NumericFormat
                    value={item.amount}
                    thousandSeparator="."
                    decimalSeparator=","
                    displayType="text"
                    decimalScale={3}
                  /> VND
                </p>

                {/* Action */}
                <div className='flex justify-center'>
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
              <p className='text-sm font-medium'>No appointments found</p>
              <p className='text-xs'>Appointments will appear here</p>
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

export default AllAppoitments