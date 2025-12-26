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
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 tracking-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>
              <NumericFormat
                value={dashData.earnings}
                thousandSeparator="."
                decimalSeparator=","
                displayType="text"
                decimalScale={3} /> VND
            </p>
            <p className='text-gray-400'>Doctors</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 tracking-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 tracking-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>
      <div className='bg-white'>
        <div className='flex items-center gap-2 px-4 py-3 mt-10 border-b bg-white'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Lastest Bookings</p>
        </div>
      </div>
      <div className='pt-4 bg-white border-white border-t-0'>
        {
          dashData.lastestAppointments.map((item, index) => (
            <div className='flex items-center px-4 py-3 gap-3 hover:bg-gray-100 transition' key={index}>
              <img className='rounded-full w-15' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600'>{slotDateFormat(item.slotDate)}</p>
              </div>
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

export default DoctorDashboard