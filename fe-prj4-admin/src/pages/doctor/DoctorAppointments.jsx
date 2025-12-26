import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react';
import { AppContext } from '../../context/AppContext'
import { NumericFormat } from 'react-number-format'
import { assets } from '../../assets/assets_admin/assets';
import { useState } from 'react';
import axios from 'axios';

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, completeAppointment, medicines, getAllMedicines, medicalTests, getAllMedicalTests } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat } = useContext(AppContext);

  const [showConfrim, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalRecordData, setMedicalRecordData] = useState({
    symptoms: '',
    diagnosis: '',
    orderedTests: [],
    prescribedMedicines: [],
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (dToken) {
      getAppointments();
      getAllMedicalTests();
      getAllMedicines();
    }
  }, [dToken]);

  const handleAccept = (appointment) => {
    setSelectedAppointment(appointment);
    setMedicalRecordData({
      ...medicalRecordData,
      userId: appointment.userId,
      doctorId: appointment.docId,
      appointmentId: appointment._id
    });
    setShowModal(true)
    setStep(1);
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_1.5fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {
          appointments.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_1.5fr_1fr_1fr] gap-1 items-center text-gray-500 px-3 py-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
              </div>
              <div>
                <p className='text-xs inline border border-primary px-2 rounded-full'>
                  {item.payment ? 'Online' : 'Cash'}
                </p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <p>
                <NumericFormat
                  value={item.amount}
                  thousandSeparator="."
                  decimalSeparator=","
                  displayType="text"
                  decimalScale={3} /> VND
              </p>
              <div className='flex'>
                <img className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                <img onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
              </div>
            </div>
          ))
        }
      </div>
      {/*popup confirm confirm*/}
      {showConfrim && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-80 shadow-lg animate-fadeIn'>
            <h2 className='text-lg font-semibold text-neutral-800 mb-3'>
              Confirm Completed
            </h2>
            <p className='text-sm text-zinc-600 mb-5'>
              Are you sure?
            </p>
            <div className='flex justify-end gap-3'>
              <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200 transition cursor-pointer' onClick={() => setShowConfirm(false)}>No</button>
              <button className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer' onClick={() => { completeAppointment(selectedId); setShowConfirm(false); }}>Yes, complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments