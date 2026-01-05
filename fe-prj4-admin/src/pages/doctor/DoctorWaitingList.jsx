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
  const [showCurrentMedicalRecordPopup, setShowCurrentMedicalRecordPopup] = useState(false);
  const [showTestDonePopup, setShowTestDonePopup] = useState(false);
  const [medicalTestsDone, setMedicalTestsDone] = useState([]);
  const [medicalRecordData, setMedicalRecordData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const addMedicineToPrescription = () => {
    setPrescribeMedicines([...prescribeMedicines, {
      medicineId: selectedItem?._id || '',
      frequency: frequency,
      duration: duration,
      dosage: dosage,
      instructions: instructions
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
        getWaitingPatients(selectedDate || undefined);
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

  const getMedicalTestsDone = async (medicalRecordId) => {
    try {
      const { data } = await axios.post(`${backendDocUrl}/medical-tests-done`, { medicalRecordId }, { headers: { dToken } });

      if (data.success) {
        setMedicalTestsDone(data.orderedTests);
        console.log(data.orderedTests);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  }

  const prescribeMeds = async (medicalRecordId) => {
    try {
      const { data } = await axios.put(`${backendDocUrl}/prescription-medicines`, {
        medicalRecordId,
        medicines: prescribeMedicines,
        followUpDate
      }, { headers: { dToken } });
      if (data.success) {
        toast.success(data.message);
        setPrescribeMedicines([]);
        setFollowUpDate('');
        getWaitingPatients(selectedDate || undefined);
        setShowPrescribeMedsPopup(false);

        // Set medical record data and show popup
        if (data.currentMedicalRecord) {
          setMedicalRecordData(data.currentMedicalRecord);
          setShowCurrentMedicalRecordPopup(true);
        } else {
          toast.error('Unable to retrieve medical record');
        }
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    if (dToken) {
      getAppointments();
      getAllMedicalTests();
      getAllMedicines();
      getWaitingPatients(selectedDate || undefined);
    }
  }, [dToken, selectedDate]);

  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 dark:bg-gray-950 min-h-screen'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2'>Waiting Patients</h1>
        <p className='text-gray-600 dark:text-gray-400'>Manage patient consultations and prescriptions</p>
      </div>

      {/* Date Filter Section */}
      <div className='mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-6 border border-blue-100 dark:border-gray-700'>
        <div className='flex flex-col sm:flex-row gap-6 items-start sm:items-end'>
          {/* Date Input */}
          <div className='flex-1'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3 flex items-center gap-2'>
              <svg className='w-5 h-5 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='w-full sm:w-80 border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 transition-all cursor-pointer'
            />
          </div>

          {/* Filter Status and Clear Button */}
          {selectedDate && (
            <div className='flex items-center gap-4 w-full sm:w-auto'>
              <div className='flex-1 sm:flex-none'>
                <div className='bg-white dark:bg-gray-600 rounded-lg px-4 py-3 border border-blue-200 dark:border-gray-500'>
                  <p className='text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide font-semibold mb-1'>Viewing</p>
                  <p className='text-sm font-bold text-blue-600 dark:text-blue-300'>
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDate('')}
                className='px-5 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 flex items-center gap-2 whitespace-nowrap'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-lg overflow-hidden'>
        {/* Table Header */}
        <div className='max-sm:hidden grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_2fr_2fr_2fr_2fr_1fr] gap-1 py-4 px-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
          <p className='text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>#</p>
          <p className='text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Patient</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Age</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Phone</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Date & Time</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Tests</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Tests Results</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Medicine</p>
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Action</p>
        </div>
        {
          waitingPatients && waitingPatients.length > 0 ? (
            <div className='max-h-[70vh] overflow-y-auto'>
              {waitingPatients.map((item, index) => (
                <div
                  className='flex flex-wrap justify-between max-sm:gap-4 max-sm:text-sm sm:grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_2fr_2fr_2fr_2fr_1fr] gap-1 items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors duration-150'
                  key={index}
                >
                  <p className='max-sm:hidden font-semibold text-gray-600 dark:text-gray-400'>{index + 1}</p>
                  <div className='flex items-center gap-3'>
                    <img className='w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700' src={item.userData.image} alt={item.userData.name} />
                    <p className='font-medium text-gray-900 dark:text-white'>{item.userData.name}</p>
                  </div>
                  <p className='max-sm:hidden text-center font-medium text-gray-700 dark:text-gray-300'>{calculateAge(item.userData.dob)} yrs</p>
                  <p className='text-center font-medium text-gray-700 dark:text-gray-300'>{item.userData.phone}</p>
                  <p className='text-center text-sm text-gray-700 dark:text-gray-300'>{slotDateFormat(item.slotDate)} <br className='sm:hidden' /> {item.slotTime}</p>

                  {/* Prescribe Tests Button */}
                  <div className='flex justify-center'>
                    {(!item.orderedTests || item.orderedTests.length === 0) && (
                      <button
                        onClick={() => { setShowPrescribeTestsPopup(true); setSelectedItem(item); }}
                        className='p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-150 group relative'
                        title='Prescribe Tests'
                      >
                        <img className='w-6 h-6 cursor-pointer' src={assets.prescribe_tests_icon} alt='Prescribe Tests' />
                        <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                          Prescribe Tests
                        </span>
                      </button>
                    )}
                  </div>

                  {/* View Test Results Button */}
                  <div className='flex justify-center'>
                    {
                      item.orderedTests?.length > 0 &&
                      item.orderedTests.every(test => test.status === 'completed') && (
                        <button
                          onClick={() => { setShowTestDonePopup(true); setSelectedItem(item); getMedicalTestsDone(item._id); }}
                          className='p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-150 group relative'
                          title='View Test Results'
                        >
                          <img className='w-6 h-6 cursor-pointer' src={assets.medical_result_icon} alt='Test Results' />
                          <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                            Tests Result
                          </span>
                        </button>
                      )
                    }
                  </div>

                  {/* Prescribe Medicine Button */}
                  <div className='flex justify-center'>
                    {
                      item.orderedTests?.length > 0 &&
                      item.orderedTests.every(test => test.status === 'completed') && (
                        <button
                          onClick={() => { setShowPrescribeMedsPopup(true); setSelectedItem(item); }}
                          className='p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors duration-150 group relative'
                          title='Prescribe Medicines'
                        >
                          <img className='w-6 h-6 cursor-pointer' src={assets.prescribe_medicines_icon} alt='Prescribe Medicines' />
                          <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                            Prescribe Medicines
                          </span>
                        </button>
                      )
                    }
                  </div>

                  {/* Cancel Button */}
                  <div className='flex justify-center'>
                    <button className='p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-150' title='Cancel'>
                      <img className='w-6 h-6 cursor-pointer' src={assets.cancel_icon} alt='Cancel' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
              <p className='text-lg font-medium'>No waiting patients</p>
              <p className='text-sm'>Check back later</p>
            </div>
          )
        }
      </div>
      {/* popup create diagnosis */}
      {
        showPrescribeTestsPopup && (
          <div className='fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4'>
            <div className='bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-4xl shadow-2xl dark:shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800'>
              <div className='mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Clinical Examination</h2>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Record symptoms, diagnosis and prescribe medical tests</p>
              </div>

              <div className='space-y-5'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Symptoms */}
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-bold text-gray-800 dark:text-gray-200'>Symptoms</label>
                    <textarea
                      className='border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 transition-all'
                      rows={4}
                      placeholder='Describe patient symptoms...'
                      value={symptons}
                      onChange={(e) => setSymptons(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Diagnosis */}
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-bold text-gray-800 dark:text-gray-200'>Diagnosis</label>
                    <textarea
                      className='border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 transition-all'
                      rows={4}
                      placeholder='Enter diagnosis...'
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Notes */}
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-bold text-gray-800 dark:text-gray-200'>Additional Notes</label>
                  <textarea
                    className='border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 transition-all'
                    rows={4}
                    placeholder='Add any additional notes...'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Prescribe Tests Section */}
              <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-800'>
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900 dark:text-white'>Prescribe Medical Tests</h3>
                    <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Select tests for the patient</p>
                  </div>
                  <a
                    className={`text-sm font-medium transition-all ${symptons.trim() && diagnosis.trim() ? 'text-primary hover:underline cursor-pointer dark:text-blue-400 dark:hover:text-blue-300' : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'}`}
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      if (!symptons.trim() || !diagnosis.trim()) {
                        toast.error('Please enter symptoms and diagnosis first.');
                        return;
                      }
                      setShowPrescribeTestsPopup(false);
                      createDiagnosis(selectedItem._id);
                      setShowPrescribeMedsPopup(true);
                    }}
                  >
                    Skip Tests
                  </a>
                </div>

                <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {medicalTests.map((test, index) => (
                      <div key={index} className='flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-blue-500 hover:shadow-sm dark:hover:shadow-lg transition-all'>
                        <input
                          type="checkbox"
                          id={`test-${index}`}
                          value={test._id}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTestIds([...testIds, test._id]);
                            } else {
                              setTestIds(testIds.filter(id => id !== test._id));
                            }
                          }}
                          className='w-4 h-4 accent-primary dark:accent-blue-500 rounded cursor-pointer'
                        />
                        <label htmlFor={`test-${index}`} className='text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1'>
                          {test.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 mt-8'>
                <button
                  className='px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
                  onClick={() => setShowPrescribeTestsPopup(false)}
                >
                  Cancel
                </button>

                <button
                  disabled={!symptons.trim() || !diagnosis.trim()}
                  className='px-6 py-2.5 rounded-lg bg-primary dark:bg-blue-600 text-white text-sm font-medium hover:bg-opacity-90 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md'
                  onClick={() => {
                    createDiagnosis(selectedItem._id);
                  }}
                >
                  Create Medical Record
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* popup prescribe medicine */}
      {
        showPrescribeMedsPopup && (
          <div className='fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4'>
            <div className='bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-4xl shadow-2xl dark:shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800'>
              <div className='mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Prescribe Medicines</h2>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Add medicines to the patient prescription</p>
              </div>

              {/* Medicines List */}
              <div className='space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2'>
                {prescribeMedicines.length === 0 ? (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    <p className='text-sm'>No medicines added yet. Click "Add Medicine" to start.</p>
                  </div>
                ) : (
                  prescribeMedicines.map((prescription, index) => (
                    <div
                      key={index}
                      className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-800/80 transition-colors'
                    >
                      <div className='grid grid-cols-1 md:grid-cols-6 gap-4 items-end'>
                        {/* Medicine Select */}
                        <div className='md:col-span-2'>
                          <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2'>Medicine</label>
                          <select
                            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-500/20 transition-all'
                            onChange={(e) =>
                              updateMedicineInPrescription(index, 'medicineId', e.target.value)
                            }
                            value={prescription.medicineId}
                          >
                            <option value="">Select Medicine</option>
                            {medicines.map((med) => (
                              <option key={med._id} value={med._id}>
                                {med.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dosage */}
                        <div>
                          <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2'>Dosage</label>
                          <input
                            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-500/20 transition-all'
                            type="text"
                            placeholder='e.g. 500mg'
                            value={prescription.dosage}
                            onChange={(e) =>
                              updateMedicineInPrescription(index, 'dosage', e.target.value)
                            }
                          />
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2'>Frequency</label>
                          <input
                            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-500/20 transition-all'
                            type="text"
                            placeholder='e.g. 2x daily'
                            value={prescription.frequency}
                            onChange={(e) =>
                              updateMedicineInPrescription(index, 'frequency', e.target.value)
                            }
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2'>Duration</label>
                          <input
                            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-500/20 transition-all'
                            type="text"
                            placeholder='e.g. 7 days'
                            value={prescription.duration}
                            onChange={(e) =>
                              updateMedicineInPrescription(index, 'duration', e.target.value)
                            }
                          />
                        </div>

                        {/* Remove Button */}
                        <div>
                          <button
                            className='w-full text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg py-2.5 transition-all'
                            onClick={() => removeMedicineFromPrescription(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className='mt-4'>
                        <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2'>Instructions</label>
                        <input
                          className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-500/20 transition-all'
                          type="text"
                          placeholder='e.g. Take with food'
                          value={prescription.instructions}
                          onChange={(e) =>
                            updateMedicineInPrescription(index, 'instructions', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Medicine Button and Follow-up Date */}
              <div className='border-t border-gray-200 dark:border-gray-800 pt-6 pb-6 space-y-4'>
                <button
                  className='text-sm font-semibold text-primary dark:text-blue-400 hover:text-primary-dark dark:hover:text-blue-300 transition-colors'
                  onClick={addMedicineToPrescription}
                >
                  + Add Another Medicine
                </button>

                <div className='flex items-end gap-4'>
                  <div className='flex-1'>
                    <label className='text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2'>Follow-up Date</label>
                    <input
                      className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 dark:focus:ring-blue-500/20 transition-all'
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3'>
                <button
                  className='px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
                  onClick={() => setShowPrescribeMedsPopup(false)}
                >
                  Cancel
                </button>

                <button
                  disabled={prescribeMedicines.length === 0}
                  className='px-6 py-2.5 rounded-lg bg-primary dark:bg-blue-600 text-white text-sm font-medium hover:bg-opacity-90 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md'
                  onClick={() => {
                    const medicalRecordId = selectedItem.from === 'medicalRecord' ? selectedItem._id : selectedItem.medicalRecord?._id;
                    if (!medicalRecordId) {
                      toast.error('Medical record not found');
                      return;
                    }
                    prescribeMeds(medicalRecordId);
                  }}
                >
                  Create Prescription
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* popup current medical record */}
      {
        showCurrentMedicalRecordPopup && medicalRecordData && (
          <div className='fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4'>
            <div className='bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-4xl shadow-2xl dark:shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-800'>
              {/* Header */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <svg className='w-6 h-6 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Medical Record Complete</h2>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Full consultation summary</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='space-y-6'>
                {/* Symptoms Section */}
                <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-blue-50 dark:bg-gray-800'>
                  <div className='flex items-center gap-2 mb-3'>
                    <svg className='w-5 h-5 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>Symptoms</h3>
                  </div>
                  <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>{medicalRecordData.symptons}</p>
                </div>

                {/* Diagnosis Section */}
                <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-purple-50 dark:bg-gray-800'>
                  <div className='flex items-center gap-2 mb-3'>
                    <svg className='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
                    </svg>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>Diagnosis</h3>
                  </div>
                  <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>{medicalRecordData.diagnosis}</p>
                </div>

                {/* Notes Section */}
                {medicalRecordData.notes && (
                  <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-yellow-50 dark:bg-gray-800'>
                    <div className='flex items-center gap-2 mb-3'>
                      <svg className='w-5 h-5 text-yellow-600 dark:text-yellow-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' />
                      </svg>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>Additional Notes</h3>
                    </div>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>{medicalRecordData.notes}</p>
                  </div>
                )}

                {/* Prescribed Medicines Section */}
                <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-green-50 dark:bg-gray-800'>
                  <div className='flex items-center gap-2 mb-4'>
                    <svg className='w-5 h-5 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.452a6 6 0 00-3.36 0l-2.387.452a2 2 0 00-1.022.547m19.5-3.405a23.995 23.995 0 00-3.178-4.041 19.772 19.772 0 00-1.97-1.516c-.207-.147-.435-.29-.67-.403.054-.016.107-.033.161-.049a6 6 0 00-7.993 7.773m12.378 5.373l-6.005 3.369m-2.82-15.897l3.359 5.73m6.984 3.268a14.975 14.975 0 01-6.743 2.051c-3.526 0-6.846-1.049-9.747-2.932' />
                    </svg>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>Prescribed Medicines</h3>
                  </div>
                  {medicalRecordData.prescribedMedicines && medicalRecordData.prescribedMedicines.length > 0 ? (
                    <div className='space-y-3'>
                      {medicalRecordData.prescribedMedicines.map((med, index) => (
                        <div key={index} className='bg-white dark:bg-gray-700 p-4 rounded-lg border border-green-200 dark:border-gray-600'>
                          <div className='flex justify-between items-start mb-2'>
                            <p className='font-semibold text-gray-900 dark:text-white'>{med.medicineData?.name || 'Medicine'}</p>
                            <span className='text-xs font-semibold px-3 py-1 bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full'>
                              {med.dosage}
                            </span>
                          </div>
                          <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div>
                              <p className='text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1'>Frequency</p>
                              <p className='text-gray-900 dark:text-white font-medium'>{med.frequency}</p>
                            </div>
                            <div>
                              <p className='text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1'>Duration</p>
                              <p className='text-gray-900 dark:text-white font-medium'>{med.durations || med.duration}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
                              <p className='text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1'>Instructions</p>
                              <p className='text-gray-700 dark:text-gray-300'>{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-600 dark:text-gray-400'>No medicines prescribed</p>
                  )}
                </div>

                {/* Ordered Tests Section */}
                {medicalRecordData.orderedTests && medicalRecordData.orderedTests.length > 0 && (
                  <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-red-50 dark:bg-gray-800'>
                    <div className='flex items-center gap-2 mb-4'>
                      <svg className='w-5 h-5 text-red-600 dark:text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>Ordered Medical Tests</h3>
                    </div>
                    <div className='space-y-2'>
                      {medicalRecordData.orderedTests.map((test, index) => (
                        <div key={index} className='bg-white dark:bg-gray-700 p-3 rounded-lg border border-red-200 dark:border-gray-600 flex items-center justify-between'>
                          <p className='text-gray-900 dark:text-white font-medium'>{test.medicalTestData?.name || 'Test'}</p>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${test.status === 'completed'
                            ? 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            }`}>
                            {test.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Date Section */}
                {medicalRecordData.followUpDate && (
                  <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-orange-50 dark:bg-gray-800'>
                    <div className='flex items-center gap-2 mb-3'>
                      <svg className='w-5 h-5 text-orange-600 dark:text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>Follow-up Appointment</h3>
                    </div>
                    <p className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                      {new Date(medicalRecordData.followUpDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className='flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800'>
                <button
                  className='px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md'
                  onClick={() => setShowCurrentMedicalRecordPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* popup test done */}
      {
        showTestDonePopup && (
          <div className='fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4'>
            <div className='bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-2xl shadow-2xl dark:shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-800'>
              {/* Header */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <svg className='w-7 h-7 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>All Tests Completed</h2>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Test results are ready for review</p>
                  </div>
                </div>
              </div>

              {/* Test Results List */}
              <div className='space-y-4 mb-8'>
                {
                  medicalTestsDone && medicalTestsDone.length > 0 ? (
                    medicalTestsDone.map((test) => (
                      <div key={test._id} className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-800/80 transition-colors'>
                        {/* Test Name */}
                        <div className='flex items-center justify-between mb-4'>
                          <h3 className='font-semibold text-lg text-gray-900 dark:text-white'>{test.medicalTestData?.name || 'Test'}</h3>
                          <span className='text-xs font-bold px-3 py-1 bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full'>
                            Completed
                          </span>
                        </div>

                        {/* Test Result */}
                        {test.result && (
                          <div className='mb-4'>
                            <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Result</p>
                            <p className='text-gray-800 dark:text-gray-200 font-medium'>{test.result}</p>
                          </div>
                        )}

                        {/* Test Notes */}
                        {test.notes && (
                          <div className='mb-4'>
                            <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Notes</p>
                            <p className='text-gray-700 dark:text-gray-300'>{test.notes}</p>
                          </div>
                        )}

                        {/* Test Images */}
                        {
                          test.images && test.images.length > 0 && (
                            <div>
                              <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-3'>Images</p>
                              <div className='flex gap-3 overflow-x-auto pb-2'>
                                {test.images.map((imgUrl, index) => (
                                  <img
                                    key={index}
                                    src={imgUrl}
                                    alt={`Test Result ${index + 1}`}
                                    className='w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0 hover:shadow-lg transition-shadow'
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        }
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                      <p className='text-sm'>No test results available</p>
                    </div>
                  )
                }
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800'>
                <button
                  className='px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
                  onClick={() => setShowTestDonePopup(false)}
                >
                  Back
                </button>
                <button
                  className='px-6 py-2.5 rounded-lg bg-green-600 dark:bg-green-600 text-white text-sm font-semibold hover:bg-green-700 dark:hover:bg-green-700 transition-all shadow-sm hover:shadow-md'
                  onClick={() => { setShowTestDonePopup(false); setShowPrescribeMedsPopup(true); }}
                >
                  Proceed to Medicines
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