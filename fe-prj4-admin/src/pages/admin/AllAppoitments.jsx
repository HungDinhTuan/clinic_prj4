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
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appoitments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1.2fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p> Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>
        {
          appointments.map((item, index) => (
            <div key={index} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1.2fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.docData.image} alt="" /> <p>{item.docData.name}</p>
              </div>
              <p><NumericFormat
                value={item.amount}
                thousandSeparator="."
                decimalSeparator=","
                displayType="text"
                decimalScale={3} /> VND</p>
              {
                item.payment
                  ? <p className='text-primary text-xs font-medium'>Pay successful</p>
                  : <img src={assets.cancel_icon} alt="" className='w-10 cursor-pointer' onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} />
              }
            </div>
          ))
        }
      </div>
      {/*popup confirm cancel*/}
      {showConfrim && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-80 shadow-lg animate-fadeIn'>
            <h2 className='text-lg font-semibold text-neutral-800 mb-3'>
              Confirm Cancellation
            </h2>
            <p className='text-sm text-zinc-600 mb-5'>
              Are you sure?
            </p>
            <div className='flex justify-end gap-3'>
              <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200 transition cursor-pointer' onClick={() => setShowConfirm(false)}>No</button>
              <button className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer' onClick={() => { cancelAppointment(selectedId); setShowConfirm(false); }}>Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllAppoitments