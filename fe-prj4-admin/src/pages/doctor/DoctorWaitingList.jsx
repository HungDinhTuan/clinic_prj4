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
    getWaitingPatients, backendDocUrl, doctorData, getDoctorData } = useContext(DoctorContext);
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
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [medicalRecordData, setMedicalRecordData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [medicalRecordsByUserId, setMedicalRecordsByUserId] = useState(null);
  const [showMedicalRecordPopup, setShowMedicalRecordPopup] = useState(false);
  const [showTestDetail, setShowTestDetail] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [expandedRecords, setExpandedRecords] = useState({});

  // Toggle medical record expand/collapse
  const toggleRecord = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  // Open test detail popup
  const openTestDetail = (test) => {
    setSelectedTest(test);
    setShowTestDetail(true);
  }

  // Close test detail popup
  const closeTestDetail = () => {
    setShowTestDetail(false);
    setSelectedTest(null);
  }

  // Add medicine to prescription list
  const addMedicineToPrescription = () => {
    setPrescribeMedicines([...prescribeMedicines, {
      medicineId: selectedItem?._id || '',
      frequency: frequency,
      duration: duration,
      dosage: dosage,
      instructions: instructions
    }]);
  }

  // Update medicine details in prescription list
  const updateMedicineInPrescription = (index, field, value) => {
    const updatedMedicines = [...prescribeMedicines];
    updatedMedicines[index][field] = value;
    setPrescribeMedicines(updatedMedicines);
  }

  // Remove medicine from prescription list
  const removeMedicineFromPrescription = (index) => {
    setPrescribeMedicines(prescribeMedicines.filter((_, i) => i !== index));
  }

  // api call to create diagnosis
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
        navigate('/doctor/waiting-tests-result');
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

  // api call to get medical tests done
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

  // api call to prescribe medicines
  const prescribeMeds = async (medicalRecordId) => {
    try {
      const { data } = await axios.put(`${backendDocUrl}/prescription-medicines`, {
        medicalRecordId,
        medicines: prescribeMedicines,
        followUpDate,
        slotTime
      }, { headers: { dToken } });
      if (data.success) {
        toast.success(data.message);
        setPrescribeMedicines([]);
        setFollowUpDate('');
        setSlotTime('');
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

  // function to convert 24-hour format to 12-hour format with AM/PM
  const convertTo12HourFormat = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
  };

  // api call to get available time slots - using logic from Appointment.jsx
  const getAvailableTimeSlots = async (dateStr) => {
    try {
      if (!dateStr) {
        setAvailableTimeSlots([]);
        setSlotTime('');
        return;
      }

      // Parse the ISO date string (YYYY-MM-DD)
      const [year, month, day] = dateStr.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);

      // Format slotDate as day_month_year for comparison with doctorData.slots_booked
      const slotDate = `${day}_${month}_${year}`;

      // Set start and end times for the day
      const startTime = new Date(selectedDate);
      startTime.setHours(10, 0, 0, 0);

      const endTime = new Date(selectedDate);
      endTime.setHours(22, 0, 0, 0);

      // Get current time for comparison if booking for today
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();

      // Get booked slots for this doctor on this date
      const bookedSlots = doctorData?.slots_booked?.[slotDate] || [];

      // Generate time slots every 30 minutes
      const timeSlots = [];
      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        // Format time in 24-hour format (HH:mm)
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        const time24 = `${hours}:${minutes}`;

        // Convert to 12-hour format for comparison
        const time12 = convertTo12HourFormat(time24);

        // Skip slots that are in the past (if booking for today)
        if (isToday && currentTime < now) {
          currentTime.setMinutes(currentTime.getMinutes() + 30);
          continue;
        }

        // Skip slots that are already booked
        if (!bookedSlots.includes(time12)) {
          timeSlots.push(time12);
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      // Add end time if not already booked
      const endHours = String(endTime.getHours()).padStart(2, '0');
      const endMinutes = String(endTime.getMinutes()).padStart(2, '0');
      const endTime24 = `${endHours}:${endMinutes}`;
      const endTime12 = convertTo12HourFormat(endTime24);

      if ((!isToday || endTime >= now) && !bookedSlots.includes(endTime12)) {
        timeSlots.push(endTime12);
      }

      setAvailableTimeSlots(timeSlots);
      setSlotTime('');
    } catch (e) {
      toast.error(e.message);
      setAvailableTimeSlots([]);
    }
  }

  // api get medcical record by user id
  const getMedicalRecordByUserId = async (userId) => {
    try {
      const { data } = await axios.post(`${backendDocUrl}/medical-record`, { userId }, { headers: { dToken } });

      if (data.success) {
        setMedicalRecordsByUserId(data.medicalRecords);
        console.log(data.medicalRecords);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  }

  // Fetch data on component mount and when dToken or selectedDate changes
  useEffect(() => {
    if (dToken) {
      getDoctorData();
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

      {/* Filters Section */}
      <div className='mb-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4'>
          {/* Date Input */}
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2'>
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40 transition-all cursor-pointer shadow-sm hover:border-gray-400 dark:hover:border-gray-500'
            />
          </div>

          {/* Clear Button */}
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className='px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm'
            >
              <svg className='w-4 h-4 inline-block mr-1.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Active Filter Badge */}
        {selectedDate && (
          <div className='mt-3 flex items-center gap-2'>
            <span className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300'>
              <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd' />
              </svg>
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
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
          <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Details</p>
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
                    {(item.isCompleted === true || item.isCompleted === 'completed') ? (
                      <div className='flex items-center justify-center px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'>
                        <svg className='w-5 h-5 text-green-600 dark:text-green-400 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='text-xs font-bold text-green-600 dark:text-green-400 uppercase'>Done</span>
                      </div>
                    ) : (
                      (!item.orderedTests || item.orderedTests.length === 0) && (
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
                      )
                    )}
                  </div>

                  {/* View Test Results Button */}
                  <div className='flex justify-center'>
                    {(item.isCompleted === true || item.isCompleted === 'completed') ? (
                      <div className='flex items-center justify-center px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'>
                        <svg className='w-5 h-5 text-green-600 dark:text-green-400 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='text-xs font-bold text-green-600 dark:text-green-400 uppercase'>Done</span>
                      </div>
                    ) : (
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
                    )}
                  </div>

                  {/* Prescribe Medicine Button */}
                  <div className='flex justify-center'>
                    {(item.isCompleted === true || item.isCompleted === 'completed') ? (
                      <div className='flex items-center justify-center px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'>
                        <svg className='w-5 h-5 text-green-600 dark:text-green-400 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='text-xs font-bold text-green-600 dark:text-green-400 uppercase'>Done</span>
                      </div>
                    ) : (
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
                    )}
                  </div>

                  {/* Show Medical Record Button */}
                  <div className='flex justify-center'>
                    <button
                      onClick={() => { setShowMedicalRecordPopup(true); getMedicalRecordByUserId(item.userId); }}
                      className='p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-150'
                      title='Show Medical Record'
                    >
                      <img className='w-6 h-6 cursor-pointer' src={assets.visibility_icon} alt='Show Medical Record' />
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

                <div className='flex flex-col sm:flex-row items-end gap-4'>
                  <div className='flex-1'>
                    <label className='text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2'>Follow-up Date</label>
                    <input
                      className='w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500'
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={followUpDate}
                      onChange={(e) => {
                        setFollowUpDate(e.target.value);
                        if (e.target.value) {
                          getAvailableTimeSlots(e.target.value);
                        } else {
                          setAvailableTimeSlots([]);
                          setSlotTime('');
                        }
                      }}
                    />
                  </div>

                  {/* Slot Time Select - Only visible when follow-up date is selected */}
                  {followUpDate && (
                    <div className='flex-1 sm:flex-initial relative'>
                      <label className='text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2'>Select Time</label>
                      <style>{`
                        .time-slots-dropdown::-webkit-scrollbar {
                          width: 8px;
                        }
                        .time-slots-dropdown::-webkit-scrollbar-track {
                          background: #f3f4f6;
                          border-radius: 10px;
                        }
                        .time-slots-dropdown::-webkit-scrollbar-thumb {
                          background: #d1d5db;
                          border-radius: 10px;
                        }
                        .time-slots-dropdown::-webkit-scrollbar-thumb:hover {
                          background: #9ca3af;
                        }
                        .dark .time-slots-dropdown::-webkit-scrollbar-track {
                          background: #1f2937;
                        }
                        .dark .time-slots-dropdown::-webkit-scrollbar-thumb {
                          background: #4b5563;
                        }
                        .dark .time-slots-dropdown::-webkit-scrollbar-thumb:hover {
                          background: #6b7280;
                        }
                      `}</style>
                      <button
                        onClick={() => setShowTimeSlots(!showTimeSlots)}
                        className='w-full sm:w-56 text-center text-sm font-medium px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white text-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                      >
                        {slotTime ? slotTime : 'Choose a time slot'}
                      </button>

                      {/* Time Slots Dropdown */}
                      {showTimeSlots && (
                        <div className='absolute bottom-full left-0 right-0 mb-2 z-10 bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-500 rounded-xl shadow-2xl overflow-hidden'>
                          <div className='time-slots-dropdown max-h-60 overflow-y-auto'>
                            {availableTimeSlots.length === 0 ? (
                              <div className='px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center'>
                                No slots available
                              </div>
                            ) : (
                              availableTimeSlots.map((slot, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSlotTime(slot);
                                    setShowTimeSlots(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${slot === slotTime
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                  {slot}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                    // if (!followUpDate) {
                    //   toast.error('Please select a follow-up date');
                    //   return;
                    // }
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
      {/* popup medical records by user ID */}
      {showMedicalRecordPopup && medicalRecordsByUserId && medicalRecordsByUserId.length > 0 && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-blue-200 dark:border-gray-600 flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>📋 Medical Records</p>
                <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>User: {medicalRecordsByUserId[0]?.userData?.name || 'N/A'}</p>
              </div>
              <button
                onClick={() => setShowMedicalRecordPopup(false)}
                className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl font-bold'
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className='p-6 space-y-6'>
              {medicalRecordsByUserId && medicalRecordsByUserId.length > 0 ? (
                <>
                  {medicalRecordsByUserId.map((record, recordIdx) => (
                    <div key={recordIdx} className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6'>
                      {/* Record Header - Doctor & Appointment Info */}
                      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700'>
                        {expandedRecords[record._id] ? (
                          <div className='flex-1'>
                            <div className='flex flex-col gap-2 flex-1'>
                              <div className={`inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full font-semibold text-sm ${record.isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                {record.isCompleted ? '✓ Completed' : '⏳ In Progress'}
                              </div>
                              <p className='text-sm text-gray-600 dark:text-gray-300 font-medium'>
                                📅 {slotDateFormat(record.slotDate)} | {record.slotTime}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className='flex-1'>
                            <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>📋 Summary</p>
                            <div className='space-y-1'>
                              {record.orderedTests && record.orderedTests.length > 0 && (
                                <p className='text-sm text-gray-600 dark:text-gray-400'>🔬 Tests: <span className='font-semibold text-gray-900 dark:text-white'>{record.orderedTests.length}</span></p>
                              )}
                              {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
                                <p className='text-sm text-gray-600 dark:text-gray-400'>💊 Medicines: <span className='font-semibold text-gray-900 dark:text-white'>{record.prescribedMedicines.length}</span></p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                          {
                            expandedRecords[record._id]
                              ? null
                              : (
                                <div className='flex flex-col gap-2 flex-1'>
                                  <div className={`inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full font-semibold text-sm ${record.isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {record.isCompleted ? '✓ Completed' : '⏳ In Progress'}
                                  </div>
                                  <p className='text-sm text-gray-600 dark:text-gray-300 font-medium'>
                                    📅 {slotDateFormat(record.slotDate)} | {record.slotTime}
                                  </p>
                                </div>
                              )
                          }
                          <button
                            onClick={() => toggleRecord(record._id)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-300 whitespace-nowrap border-2 text-base flex items-center justify-center gap-2 ${expandedRecords[record._id]
                              ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600 shadow-md dark:bg-blue-600 dark:hover:bg-blue-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600'
                              }`}
                          >
                            <span>{expandedRecords[record._id] ? '△' : '▽'}</span>
                            <span>{expandedRecords[record._id] ? 'Collapse' : 'Expand'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Ordered Tests - Always Visible */}
                      {record.orderedTests && record.orderedTests.length > 0 && (
                        <div className='mt-6 bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600'>
                          <p className='text-sm font-bold text-gray-900 dark:text-white mb-4'>🔬 Ordered Tests</p>
                          <div className='space-y-3'>
                            {record.orderedTests.map((test, idx) => (
                              <div key={idx} className='bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-100 dark:border-gray-500'>
                                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                                  <div className='flex-1'>
                                    <p className='font-semibold text-gray-900 dark:text-white'>{test.medicalTestData?.name || 'N/A'}</p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Status: <span className={`font-semibold ${test.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{test.status}</span></p>
                                  </div>
                                  <div className='flex flex-col gap-2'>
                                    <div className='text-right'>
                                      <p className='text-xs text-gray-600 dark:text-gray-300'>Price</p>
                                      <p className='font-bold text-blue-600 dark:text-blue-400'>
                                        <NumericFormat
                                          value={test.medicalTestData?.price || 0}
                                          displayType={'text'}
                                          thousandSeparator={true}
                                          suffix={' VND'}
                                        />
                                      </p>
                                    </div>
                                    {test.result && (
                                      <div className='text-right'>
                                        <p className='text-xs text-gray-600 dark:text-gray-300'>Result</p>
                                        <p className='font-semibold text-gray-900 dark:text-white'>{test.result}</p>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => openTestDetail(test)}
                                    className='px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all text-sm'
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescribed Medicines - Always Visible */}
                      {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
                        <div className='mt-6 bg-green-50 dark:bg-gray-700 rounded-xl p-5 border border-green-200 dark:border-gray-600'>
                          <p className='text-sm font-bold text-gray-900 dark:text-white mb-4'>💊 Prescribed Medicines</p>
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            {record.prescribedMedicines.map((medicine, idx) => (
                              <div key={idx} className='bg-white dark:bg-gray-600 p-4 rounded-lg border border-green-100 dark:border-gray-500'>
                                <div className='flex items-start gap-3'>
                                  <div className='text-2xl'>💊</div>
                                  <div className='flex-1'>
                                    <p className='font-bold text-gray-900 dark:text-white'>{medicine.medicineData?.name}</p>
                                    <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>{medicine.medicineData?.genericName}</p>

                                    <div className='mt-3 space-y-2'>
                                      <div className='flex justify-between text-sm'>
                                        <span className='font-semibold text-gray-700 dark:text-gray-300'>Category:</span>
                                        <span className='text-gray-900 dark:text-white'>{medicine.medicineData?.category}</span>
                                      </div>
                                      <div className='flex justify-between text-sm'>
                                        <span className='font-semibold text-gray-700 dark:text-gray-300'>Form:</span>
                                        <span className='text-gray-900 dark:text-white'>{medicine.medicineData?.form}</span>
                                      </div>
                                      <div className='flex justify-between text-sm'>
                                        <span className='font-semibold text-gray-700 dark:text-gray-300'>Dosage:</span>
                                        <span className='text-gray-900 dark:text-white font-medium'>{medicine.dosage}</span>
                                      </div>
                                      {medicine.frequency && (
                                        <div className='flex justify-between text-sm'>
                                          <span className='font-semibold text-gray-700 dark:text-gray-300'>Frequency:</span>
                                          <span className='text-gray-900 dark:text-white'>{medicine.frequency}</span>
                                        </div>
                                      )}
                                      {medicine.duration && (
                                        <div className='flex justify-between text-sm'>
                                          <span className='font-semibold text-gray-700 dark:text-gray-300'>Duration:</span>
                                          <span className='text-gray-900 dark:text-white'>{medicine.duration}</span>
                                        </div>
                                      )}
                                    </div>

                                    {medicine.instructions && (
                                      <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-500'>
                                        <p className='text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>Instructions:</p>
                                        <p className='text-xs text-gray-600 dark:text-gray-400'>{medicine.instructions}</p>
                                      </div>
                                    )}

                                    <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-500'>
                                      <p className='text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>Side Effects:</p>
                                      <p className='text-xs text-gray-600 dark:text-gray-400'>{medicine.medicineData?.sideEffects}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expandable Content */}
                      {expandedRecords[record._id] && (
                        <div className='animate-in fade-in-0 slide-in-from-top-2 duration-300'>
                          {/* Clinical Information */}
                          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            {/* Symptoms */}
                            {record.symptons && (
                              <div className='bg-orange-50 dark:bg-gray-700 rounded-xl p-5 border border-orange-200 dark:border-gray-600'>
                                <p className='text-sm font-bold text-gray-900 dark:text-white mb-3'>🔍 Symptoms</p>
                                <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{record.symptons}</p>
                              </div>
                            )}

                            {/* Diagnosis */}
                            {record.diagnosis && (
                              <div className='bg-purple-50 dark:bg-gray-700 rounded-xl p-5 border border-purple-200 dark:border-gray-600'>
                                <p className='text-sm font-bold text-gray-900 dark:text-white mb-3'>📋 Diagnosis</p>
                                <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{record.diagnosis}</p>
                              </div>
                            )}
                          </div>

                          {/* Doctor's Notes */}
                          {record.notes && (
                            <div className='mt-6 bg-yellow-50 dark:bg-gray-700 rounded-xl p-5 border border-yellow-200 dark:border-gray-600'>
                              <p className='text-sm font-bold text-gray-900 dark:text-white mb-3'>📝 Doctor's Notes</p>
                              <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{record.notes}</p>
                            </div>
                          )}

                          {/* Doctor Information - At the end */}
                          <div className='mt-6 bg-blue-50 dark:bg-gray-700 rounded-xl p-5 border border-blue-200 dark:border-gray-600'>
                            <p className='text-sm font-bold text-gray-900 dark:text-white mb-4'>👨‍⚕️ Doctor Information</p>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                              <div className='flex justify-between'>
                                <span className='font-semibold text-gray-700 dark:text-gray-300'>Doctor:</span>
                                <span className='text-gray-900 dark:text-white font-medium'>{record.doctorData?.name || 'N/A'}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='font-semibold text-gray-700 dark:text-gray-300'>Speciality:</span>
                                <span className='text-gray-900 dark:text-white font-medium'>{record.doctorData?.speciality || 'N/A'}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='font-semibold text-gray-700 dark:text-gray-300'>Experience:</span>
                                <span className='text-gray-900 dark:text-white font-medium'>{record.doctorData?.experience || 'N/A'}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='font-semibold text-gray-700 dark:text-gray-300'>Degree:</span>
                                <span className='text-gray-900 dark:text-white font-medium'>{record.doctorData?.degree || 'N/A'}</span>
                              </div>
                              <div className='flex justify-between sm:col-span-2'>
                                <span className='font-semibold text-gray-700 dark:text-gray-300'>Email:</span>
                                <span className='text-gray-900 dark:text-white font-medium'>{record.doctorData?.email || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className='text-center py-12'>
                  <p className='text-lg text-gray-600 dark:text-gray-400'>No medical records found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-6 flex justify-end'>
              <button
                onClick={() => setShowMedicalRecordPopup(false)}
                className='px-6 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-all'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* popup test detail */}
      {showTestDetail && selectedTest && (
        <div className='fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800'>
            {/* Header */}
            <div className='sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-blue-200 dark:border-gray-700 flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>🔬 Test Results</p>
                <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>{selectedTest.medicalTestData?.name}</p>
              </div>
              <button
                onClick={closeTestDetail}
                className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl font-bold'
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className='p-6 space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase'>Status</p>
                  <p className={`text-lg font-bold mt-2 ${selectedTest.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {selectedTest.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                  </p>
                </div>
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase'>Price</p>
                  <p className='text-lg font-bold text-blue-600 dark:text-blue-400 mt-2'>
                    {selectedTest.medicalTestData?.price ? `${selectedTest.medicalTestData.price.toLocaleString('vi-VN')} VND` : 'N/A'}
                  </p>
                </div>
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase'>Result</p>
                  <p className='text-lg font-bold text-gray-900 dark:text-white mt-2'>{selectedTest.result || 'N/A'}</p>
                </div>
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase'>Turnaround Time</p>
                  <p className='text-lg font-bold text-gray-900 dark:text-white mt-2'>{selectedTest.medicalTestData?.turnaroundTime || 'N/A'} days</p>
                </div>
              </div>

              {/* Description */}
              {selectedTest.medicalTestData?.description && (
                <div className='bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4'>
                  <p className='text-sm font-bold text-gray-900 dark:text-white mb-2'>📖 Description</p>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.description}</p>
                </div>
              )}

              {/* Preparation */}
              {selectedTest.medicalTestData?.preparation && (
                <div className='bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 rounded-lg p-4'>
                  <p className='text-sm font-bold text-gray-900 dark:text-white mb-2'>⚠️ Preparation</p>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.preparation}</p>
                </div>
              )}

              {/* Normal Range */}
              {selectedTest.medicalTestData?.normalRange && (
                <div className='bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700 rounded-lg p-4'>
                  <p className='text-sm font-bold text-gray-900 dark:text-white mb-2'>✓ Normal Range</p>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.normalRange}</p>
                </div>
              )}

              {/* Notes */}
              {selectedTest.notes && (
                <div className='bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 rounded-lg p-4'>
                  <p className='text-sm font-bold text-gray-900 dark:text-white mb-2'>📝 Notes</p>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.notes}</p>
                </div>
              )}

              {/* Test Images */}
              {selectedTest.images && selectedTest.images.length > 0 && (
                <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
                  <p className='text-sm font-bold text-gray-900 dark:text-white mb-4'>🖼️ Test Images</p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {selectedTest.images.map((image, idx) => (
                      <div key={idx} className='rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm'>
                        <img src={image} alt={`Test result ${idx + 1}`} className='w-full h-64 object-cover' />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end'>
              <button
                onClick={closeTestDetail}
                className='px-6 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-all'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorWaitingList