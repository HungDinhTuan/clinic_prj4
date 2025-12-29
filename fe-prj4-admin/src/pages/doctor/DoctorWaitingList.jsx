import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react';
import { AppContext } from '../../context/AppContext'
import { NumericFormat } from 'react-number-format'
import { assets } from '../../assets/assets_admin/assets';
import { useState } from 'react';
import axios from 'axios';

const DoctorWaitingList = () => {

  const navigate = useNavigate();

  const { dToken, appointments, getAppointments, completeAppointment, medicines, getAllMedicines, medicalTests, getAllMedicalTests, waitingPatients,
    getWaitingPatients, backendDocUrl } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat } = useContext(AppContext);

  const [symptons, setSymptons] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [testIds, setTestIds] = useState([]);
  const [prescribeMedicines, setPrescribeMedicines] = useState([]);
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  // console.log(selectedItem);
  const [showPrescribeTestsPopup, setShowPrescribeTestsPopup] = useState(false);
  const [showPrescribeMedsPopup, setShowPrescribeMedsPopup] = useState(false);

  const addMedicineToPrescription = () => {
    setPrescribeMedicines([...prescribeMedicines, {
      medicineId: '',
      frequency: '',
      duration: '',
      dosage: '',
      instructions: ''
    }]);
  }

  const updateMedicineInPrescription = (index, field, value) => {
    const updatedMedicines = [...prescribeMedicines];
    updatedMedicines[index][field] = value;
    setPrescribeMedicines(updatedMedicines);
  }

  const removeMedicineFromPrescription = (index) => {
    setPrescribeMedicines(prescribeMedicines.filter((_, i) => i !== index));
  }

  const createDiagnosis = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendDocUrl}/create-diagnosis`, {
        appointmentId,
        symptons,
        diagnosis,
        notes,
        testIds
      }, { headers: { dToken } });
      if (data.success) {
        toast.success(data.message);
        setSymptons('');
        setDiagnosis('');
        setTestIds([]);
        getWaitingPatients();
        if (testIds.length === 0) {
          setShowPrescribeTestsPopup(false);
          setShowPrescribeMedsPopup(true);
        } else {
          setShowPrescribeTestsPopup(false);
        }
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  const prescribeTests = async (medicalRecordId) => {
    try {
      const { data } = await axios.put(`${backendDocUrl}/prescribe-medicines`, {
        medicalRecordId,
        prescribeMedicines,
        followUpDate
      }, { headers: { dToken } });
      if (data.success) {
        toast.success(data.message);
        setPrescribeMedicines([]);
        setFollowUpDate('');
        getWaitingPatients();
        setShowPrescribeMedsPopup(false);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response.data.message || e.message);
    }
  }

  useEffect(() => {
    if (dToken) {
      getAppointments();
      getAllMedicalTests();
      getAllMedicines();
      getWaitingPatients();
    }
  }, [dToken]);

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>The List of Waiting Patients</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_2fr_2fr_2fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p className='text-center'>Age</p>
          <p className='text-center'>Phone</p>
          <p className='text-center'>Date & Time</p>
          <p className='text-center'>Prescribe Tests</p>
          <p className='text-center'>Prescribe Medicine</p>
          <p className='text-center'>Action</p>
        </div>
        {
          waitingPatients.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_2fr_2fr_2fr_1fr] gap-1 items-center text-gray-500 px-3 py-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden flex justify-center items-center'>{calculateAge(item.userData.dob)}</p>
              <p className='flex justify-center items-center'>{item.userData.phone}</p>
              <p className='flex justify-center items-center'>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              {/* Prescribe Tests */}
              <div className='flex justify-center items-center'>
                {
                  (!item.orderedTests || item.orderedTests.length === 0) && (
                    <img
                      onClick={() => { setShowPrescribeTestsPopup(true); setSelectedItem(item); }}
                      className='w-10 cursor-pointer'
                      src={assets.prescribe_tests_icon}
                    />
                  )
                }
              </div>
              {/* Prescribe Medicine */}
              <div className='flex justify-center items-center'>
                {
                  item.orderedTests?.length > 0 &&
                  item.orderedTests.every(test => test.status === 'completed') && (
                    <img
                      onClick={() => { setShowPrescribeMedsPopup(true); setSelectedItem(item); }}
                      className='w-10 cursor-pointer'
                      src={assets.prescribe_medicines_icon}
                    />
                  )
                }
              </div>
              {/* <p>
                <NumericFormat
                  value={item.amount}
                  thousandSeparator="."
                  decimalSeparator=","
                  displayType="text"
                  decimalScale={3} /> VND
              </p> */}
              <div className='flex justify-center items-center'>
                <img className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                {/* <img onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" /> */}
              </div>
            </div>
          ))
        }
      </div>
      {/* popup create diagnosis */}
      {
        showPrescribeTestsPopup && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl p-6 w-full max-w-4xl shadow-lg animate-fadeIn'>
              <p className='text-lg font-semibold text-neutral-800 mb-4'>
                Clinical Examination
              </p>

              <div className='flex flex-col gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Symptoms</label>
                    <textarea
                      className='border rounded-lg px-2 py-2 text-sm resize-none'
                      rows={4}
                      value={symptons}
                      onChange={(e) => setSymptons(e.target.value)}
                    ></textarea>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Diagnosis</label>
                    <textarea
                      className='border rounded-lg px-2 py-2 text-sm resize-none'
                      rows={4}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-700'>Notes</label>
                  <textarea
                    className='border rounded-lg px-2 py-2 text-sm resize-none'
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className='flex justify-between items-center mb-4 mt-6'>
                <p className='text-base font-medium text-neutral-800 mb-2'>
                  Prescribe Tests
                </p>
                <a
                  className={`text-sm hover:underline ${symptons.trim() && diagnosis.trim() ? 'text-blue-600 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    if (!symptons.trim() || !diagnosis.trim()) {
                      toast.error('Please enter symptons and diagnosis first.');
                      return;
                    }
                    setShowPrescribeTestsPopup(false);
                    createDiagnosis(selectedItem._id);
                    setShowPrescribeMedsPopup(true);
                  }}
                >
                  Skip Medical Tests
                </a>
              </div>

              <div className='border rounded-lg p-3 mb-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {medicalTests.map((test, index) => (
                    <div key={index} className='flex items-center gap-2 text-sm text-gray-700'>
                      <input
                        type="checkbox"
                        value={test._id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTestIds([...testIds, test._id]);
                          } else {
                            setTestIds(testIds.filter(id => id !== test._id));
                          }
                        }}
                      />
                      <label>{test.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  className='px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 transition cursor-pointer'
                  onClick={() => setShowPrescribeTestsPopup(false)}
                >
                  Cancel
                </button>

                <button
                  className='px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition cursor-pointer'
                  onClick={() => {
                    createDiagnosis(selectedItem._id);
                  }}
                >
                  Create Medical Tests
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* popup prescribe medicine */}
      {
        showPrescribeMedsPopup && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg animate-fadeIn'>
              <p className='text-lg font-semibold text-neutral-800 mb-4'>
                Prescribe Medicines
              </p>

              <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
                {prescribeMedicines.map((prescription, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-1 md:grid-cols-6 gap-3 items-center border rounded-lg p-3'
                  >
                    <select
                      className='border rounded-lg px-2 py-2 text-sm md:col-span-2'
                      onChange={(e) =>
                        updateMedicineInPrescription(index, 'medicineId', e.target.value)
                      }
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((med) => (
                        <option key={med._id} value={med._id}>
                          {med.name}
                        </option>
                      ))}
                    </select>

                    <input
                      className='border rounded-lg px-2 py-2 text-sm'
                      type="text"
                      placeholder='Dosage'
                      onChange={(e) =>
                        updateMedicineInPrescription(index, 'dosage', e.target.value)
                      }
                    />
                    <input
                      className='border rounded-lg px-2 py-2 text-sm'
                      type="text"
                      placeholder='Frequency'
                      onChange={(e) =>
                        updateMedicineInPrescription(index, 'frequency', e.target.value)
                      }
                    />
                    <input
                      className='border rounded-lg px-2 py-2 text-sm'
                      type="text"
                      placeholder='Duration'
                      onChange={(e) =>
                        updateMedicineInPrescription(index, 'duration', e.target.value)
                      }
                    />
                    <input
                      className='border rounded-lg px-2 py-2 text-sm'
                      type="text"
                      placeholder='Instructions'
                      onChange={(e) =>
                        updateMedicineInPrescription(index, 'instructions', e.target.value)
                      }
                    />

                    <button
                      className='text-sm text-red-600 hover:underline cursor-pointer'
                      onClick={() => removeMedicineFromPrescription(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className='flex items-center justify-between mt-4'>
                <button
                  className='text-sm text-primary underline cursor-pointer'
                  onClick={addMedicineToPrescription}
                >
                  + Add Medicine
                </button>

                <div className='flex items-center gap-2'>
                  <label className='text-sm text-gray-600 mr-2'>Follow-up Date:</label>
                  <input
                    className='border rounded-lg px-2 py-2 text-sm'
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <button
                  className='px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 transition  cursor-pointer'
                  onClick={() => setShowPrescribeMedsPopup(false)}
                >
                  Cancel
                </button>

                <button
                  className='px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition cursor-pointer'
                  onClick={() => {
                    prescribeTests(selectedItem.medicalRecord._id);
                  }}
                >
                  Create Prescription
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default DoctorWaitingList