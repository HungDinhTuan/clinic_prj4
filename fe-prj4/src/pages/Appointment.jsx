import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';
import { NumericFormat } from 'react-number-format'

const Appointment = () => {

  const { docId } = useParams();
  const { doctors, backendURL, token, getDoctorsData, userData, loadUserProfileData } = useContext(AppContext);
  console.log(userData);
  

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [expandedDates, setExpandedDates] = useState(false);
  const [expandedTimes, setExpandedTimes] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandMoreTimes, setExpandMoreTimes] = useState(false);
  const [selectedFromMore, setSelectedFromMore] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [bookForAnother, setBookForAnother] = useState(false);
  const [userNotSigned, setUserNotSigned] = useState({
    name: '',
    email: '',
    gender: '',
    birthday: '',
    phone: '',
    address1: '',
    address2: '',
    relationship: ''
  });
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Fetch doctor info based on docId
  const fetchDocInfo = async () => {
    const docInfo = doctors?.find(doc => doc._id === docId) ?? null;
    setDocInfo(docInfo);
  };

  // Get display text for selected custom date
  const getDisplayDateText = () => {
    if (!customDate) return 'More Dates';

    const [year, month, day] = customDate.split('-').map(Number);
    const dayOfWeek = daysOfWeek[new Date(year, month - 1, day).getDay()];
    return `${dayOfWeek}\n${day}`;
  };

  // create calendar days for date picker
  const generateCalendarDays = () => {
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    const lastDay = new Date(pickerYear, pickerMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // handle date selection from calendar
  const handleDateSelect = (day) => {
    if (!day) return;

    const selectedDate = new Date(pickerYear, pickerMonth, day);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is within valid range
    if (selectedDate < today) return;

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 45);
    if (selectedDate > maxDate) return;

    // Format date as YYYY-MM-DD and find it in docSlots
    const year = selectedDate.getFullYear();
    const monthNum = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayNum = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthNum}-${dayNum}`;

    // Find index in docSlots
    for (let i = 0; i < docSlots.length; i++) {
      if (docSlots[i].length > 0) {
        const slotDate = docSlots[i][0].datetime;
        if (slotDate.getDate() === day &&
          slotDate.getMonth() + 1 === parseInt(monthNum) &&
          slotDate.getFullYear() === year) {
          setSlotIndex(i);
          setCustomDate(dateStr);
          setSlotTime('');
          setSelectedFromMore(true);
          setShowDatePicker(false);
          break;
        }
      }
    }
  };

  // calculate available slots for the next 46 days
  const getAvailableSlots = async () => {
    const slots = [];
    const today = new Date();

    for (let i = 0; i < 46; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(22, 0, 0, 0);

      let startTime = new Date(currentDate);
      if (i === 0) {
        startTime.setHours(today.getHours(), today.getMinutes(), 0, 0);
      } else {
        startTime.setHours(10, 0, 0, 0);
      }

      if (startTime.getHours() < 10) {
        startTime.setHours(10, 0, 0, 0);
      }

      // Advance to the next 30-minute slot if not exactly on one
      let minutes = startTime.getMinutes();
      if (minutes % 30 !== 0) {
        startTime.setMinutes(Math.ceil(minutes / 30) * 30);
        if (startTime.getMinutes() === 60) {
          startTime.setMinutes(0);
          startTime.setHours(startTime.getHours() + 1);
        }
      }

      // Optionally, skip to the next slot if you want to start after current time exactly
      // startTime.setMinutes(startTime.getMinutes() + 30);

      const timeSlots = [];
      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const formattedTime = currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentTime.getDate();
        let month = currentTime.getMonth() + 1;
        let year = currentTime.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo?.slots_booked[slotDate] && docInfo?.slots_booked[slotDate].includes(slotTime) ? false : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentTime),
            time: formattedTime,
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      slots.push(timeSlots);
    }
    setDocSlots(slots);
  };

  // handle booking appointment
  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment.')
      localStorage.setItem('pendingDocId', docId);
      localStorage.setItem('pendingSlotIndex', slotIndex.toString());
      localStorage.setItem('pendingSlotTime', slotTime);
      localStorage.setItem('pendingCustomDate', customDate);
      localStorage.setItem('pendingUserNotSigned', JSON.stringify(userNotSigned));
      localStorage.setItem('pendingBookForAnother', JSON.stringify(bookForAnother));
      localStorage.setItem('redirectAfterLogin', `/appointment/${docId}`);
      return navigate('/login');
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      // Prepare request body with required fields
      const requestBody = {
        docId,
        slotDate,
        slotTime
      };

      // Add non-signed user data if booking for another
      if (bookForAnother) {
        const addressStr = JSON.stringify({
          line1: userNotSigned.address1,
          line2: userNotSigned.address2
        });
        Object.assign(requestBody, {
          name: userNotSigned.name,
          email: userNotSigned.email,
          phone: userNotSigned.phone,
          gender: userNotSigned.gender,
          dob: userNotSigned.birthday,
          address: addressStr,
          relationship: userNotSigned.relationship
        });
      }

      const { data } = await axios.post(`${backendURL}/user/booking-appointment`,
        requestBody,
        { headers: { token } })

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        setBookForAnother(false);
        setUserNotSigned({
          name: '',
          email: userData?.email || '',
          gender: '',
          birthday: '',
          phone: userData?.phone || '',
          address1: '',
          address2: '',
          relationship: ''
        });
        navigate('/my-appointments');
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message)
    }
  }

  // Fetch doctor info when docId or doctors list changes
  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);

  // Load user profile data on token change
  useEffect(() => {
    if (token && (!userData || Object.keys(userData).length === 0)) {
      loadUserProfileData();
    }
  }, [token]);

  // Fetch available slots when docInfo changes
  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  // log docSlots
  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

 // Reset slotTime when slotIndex or customDate changes
  useEffect(() => {
    setExpandedTimes(false);
    if (!customDate) {
      setSlotTime('');
    }
  }, [slotIndex]);

  // restore pending data after login
  useEffect(() => {
    if (token && docSlots.length > 0) {
      const savedDocId = localStorage.getItem('pendingDocId');
      const savedSlotIndexStr = localStorage.getItem('pendingSlotIndex');
      const savedSlotTime = localStorage.getItem('pendingSlotTime');
      const savedCustomDate = localStorage.getItem('pendingCustomDate');
      const savedUserNotSigned = localStorage.getItem('pendingUserNotSigned');
      const savedBookForAnother = localStorage.getItem('pendingBookForAnother');

      if (!savedSlotIndexStr && !savedSlotTime && !savedCustomDate && !savedUserNotSigned && !savedBookForAnother) return;

      // restore saved slot time and date
      if (savedSlotIndexStr) {
        const savedIndex = Number(savedSlotIndexStr);
        if (docSlots[savedIndex] && docSlots[savedIndex].length > 0) {
          setSlotIndex(savedIndex);

          if (savedSlotTime) {
            const isValidTime = docSlots[savedIndex].some(slot => slot.time === savedSlotTime);
            if (isValidTime) {
              setSlotTime(savedSlotTime);
            } else {
              setSlotTime('');
            }
          }
        }
      } else if (savedSlotTime) {
        // time only save, check current date
        const currentDateSlots = docSlots[slotIndex];
        if (currentDateSlots?.some(slot => slot.time === savedSlotTime)) {
          setSlotTime(savedSlotTime);
        }
      }

      // restore saved customDate
      if (savedCustomDate) {
        setCustomDate(savedCustomDate);
        setSelectedFromMore(true);
      }

      // restore saved userNotSigned and bookForAnother
      if (savedUserNotSigned) {
        try {
          const parsedUserNotSigned = JSON.parse(savedUserNotSigned);
          setUserNotSigned(parsedUserNotSigned);
        } catch (error) {
          console.log('Error parsing userNotSigned:', error);
        }
      }

      if (savedBookForAnother) {
        try {
          const parsedBookForAnother = JSON.parse(savedBookForAnother);
          setBookForAnother(parsedBookForAnother);
        } catch (error) {
          console.log('Error parsing bookForAnother:', error);
        }
      }

      // clear saved data
      localStorage.removeItem('pendingDocId');
      localStorage.removeItem('pendingSlotIndex');
      localStorage.removeItem('pendingSlotTime');
      localStorage.removeItem('pendingCustomDate');
      localStorage.removeItem('pendingUserNotSigned');
      localStorage.removeItem('pendingBookForAnother');
      localStorage.removeItem('redirectAfterLogin');
    }
  }, [token, docSlots.length]);

  return docInfo && (
    <div className='pt-5'>
      {/*---------------Doctor Details--------------- */}
      <div className='flex flex-col sm:flex-row gap-6 px-4 sm:px-0'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300' src={docInfo?.image} alt={docInfo?.name} />
        </div>
        <div className='flex-1 border border-gray-200 rounded-2xl p-8 py-8 bg-white sm:mt-0 shadow-lg hover:shadow-xl transition-shadow duration-300'>
          {/*---------------Doctor Info : name, degree, speciality, experience--------------- */}
          <p className='flex items-center gap-2 text-3xl font-bold text-gray-900'>
            {docInfo?.name}
            <img className='w-5' src={assets.verified_icon} alt="Verified" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-3 text-gray-600'>
            <p className='font-medium'>{docInfo?.degree} - {docInfo?.speciality}</p>
            <button className='py-1 px-3 border border-gray-300 text-xs rounded-full font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-300'>{docInfo?.experience}</button>
          </div>
          {/*---------------Doctor Abouts--------------- */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <p className='flex items-center gap-2 text-sm font-bold text-gray-900 mb-3'>
              <img src={assets.info_icon} alt="" />
              About
            </p>
            <p className='text-sm text-gray-600 max-w-[700px] leading-relaxed'>{docInfo?.about}</p>
          </div>
          <p className='text-gray-700 font-semibold mt-6'>
            Appointment fee:&#160;
            <span className='text-primary text-lg'>
              <NumericFormat
                value={docInfo?.fees}
                thousandSeparator="."
                decimalSeparator=","
                displayType="text"
                decimalScale={3} /> VND</span>
          </p>
        </div>
      </div>
      {/*---------------Booking Slots--------------- */}
      <div className='sm:ml-72 sm:pl-4 mt-10 font-medium text-gray-700 px-4 sm:px-0'>
        <div className='mb-6 flex items-center justify-between gap-4'>
          <p className="text-2xl font-bold text-gray-900">Select Date </p>
          {/* Book for Another */}
          {
            bookForAnother
              ? (
                <button
                  className="text-red-500 font-medium hover:text-red-700 transition duration-200 whitespace-nowrap text-sm sm:text-base cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setBookForAnother(false);
                    setUserNotSigned({
                      name: '',
                      email: userData?.email || '',
                      gender: '',
                      birthday: '',
                      phone: userData?.phone || '',
                      address1: '',
                      address2: '',
                      relationship: ''
                    });
                  }}
                >
                  - Cancel
                </button>
              )
              : (
                <button
                  className="text-primary font-medium hover:text-primary-dark transition duration-200 whitespace-nowrap text-sm sm:text-base cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setBookForAnother(true);
                    setUserNotSigned({
                      name: '',
                      email: '',
                      gender: '',
                      birthday: '',
                      phone: '',
                      address1: '',
                      address2: '',
                      relationship: ''
                    });
                  }}
                >
                  + Book for Another
                </button>
              )
          }
        </div>
        {/* Patient Information Form */}
        {
          bookForAnother && (
            <div className='mb-6 p-6 border-2 border-blue-200 rounded-lg bg-white shadow-sm mx-4 sm:mx-0'>
              <p className='font-semibold text-gray-800 mb-4 text-lg'>📋 Enter Patient's Information</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>👤 Full Name</label>
                  <input
                    type='text'
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                    placeholder='Enter full name'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, name: e.target.value })}
                    value={userNotSigned.name}
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>🎂 Date of Birth</label>
                  <input
                    type='date'
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, birthday: e.target.value })}
                    value={userNotSigned.birthday}
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>📧 Email</label>
                  <input
                    type='email'
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                    placeholder='Enter email address'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, email: e.target.value })}
                    value={userNotSigned.email}
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>📞 Phone Number</label>
                  <input
                    type='tel'
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                    placeholder='Enter phone number'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, phone: e.target.value })}
                    value={userNotSigned.phone}
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>🏠 Address</label>
                  <input
                    type='text'
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition mb-2'
                    placeholder='Street address'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, address1: e.target.value })}
                    value={userNotSigned.address1}
                  />
                  <input
                    type='text'
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                    placeholder='City, province (optional)'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, address2: e.target.value })}
                    value={userNotSigned.address2}
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>👥 Gender</label>
                  <select
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white cursor-pointer'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, gender: e.target.value })}
                    value={userNotSigned.gender}
                  >
                    <option value=''>-- Select Gender --</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>📱 Relationship</label>
                  <select
                    required
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white cursor-pointer'
                    onChange={(e) => setUserNotSigned({ ...userNotSigned, relationship: e.target.value })}
                    value={userNotSigned.relationship}
                  >
                    <option value=''>-- Select Relationship --</option>
                    <option value='Parent'>Parent</option>
                    <option value='Sibling'>Sibling</option>
                    <option value='Spouse'>Spouse</option>
                    <option value='Child'>Child</option>
                    <option value='Relative'>Relative</option>
                    <option value='Friend'>Friend</option>
                  </select>
                </div>
              </div>
            </div>
          )
        }
        <div className='grid grid-cols-7 gap-3 mt-4 relative'>
          {
            docSlots.length && docSlots.slice(0, 6).map((item, index) => (
              item.length > 0 && (
                <div
                  onClick={() => {
                    setSlotIndex(index);
                    setCustomDate('');
                    setShowDatePicker(false);
                    setSelectedFromMore(false);
                  }}
                  className={`text-center py-4 px-2 rounded-xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${slotIndex === index && !customDate ? 'bg-primary text-white shadow-lg' : 'border border-gray-200 bg-white hover:bg-blue-50'}`}
                  key={index}
                >
                  <p className='font-semibold'>{daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p className='text-lg'>{item[0].datetime.getDate()}</p>
                </div>
              )
            ))
          }

          {/* More Dates Button */}
          {docSlots.length > 0 && (
            <>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`text-center py-4 px-2 rounded-xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${customDate && selectedFromMore ? 'bg-primary text-white shadow-lg' : 'border border-gray-200 bg-white hover:bg-blue-50'}`}
              >
                {customDate && selectedFromMore ? (
                  <>
                    <p className="font-semibold text-sm">
                      {getDisplayDateText().split('\n')[0]}
                    </p>
                    <p className="text-lg font-semibold">
                      {customDate.split('-')[2]}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-sm">More Dates</p>
                  </>
                )}
              </button>

              {/* Calendar Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => {
                          if (pickerMonth === 0) {
                            setPickerMonth(11);
                            setPickerYear(pickerYear - 1);
                          } else {
                            setPickerMonth(pickerMonth - 1);
                          }
                        }}
                        className="text-sm font-semibold text-gray-700 hover:text-primary px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-300"
                      >
                        ← Prev
                      </button>
                      <span className="text-lg font-bold text-gray-900">
                        {month[pickerMonth]} {pickerYear}
                      </span>
                      <button
                        onClick={() => {
                          if (pickerMonth === 11) {
                            setPickerMonth(0);
                            setPickerYear(pickerYear + 1);
                          } else {
                            setPickerMonth(pickerMonth + 1);
                          }
                        }}
                        className="text-sm font-semibold text-gray-700 hover:text-primary px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-300"
                      >
                        Next →
                      </button>
                    </div>

                    {/* Days of week headers */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-700">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendarDays().map((day, idx) => {
                        const dayDate = day ? new Date(pickerYear, pickerMonth, day) : null;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const maxDate = new Date(today);
                        maxDate.setDate(maxDate.getDate() + 45);

                        const isToday = day && dayDate.toDateString() === new Date().toDateString();
                        const isSelected = day && customDate === `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isBeforeToday = day && dayDate < today;
                        const isAfterMax = day && dayDate > maxDate;
                        const isDisabled = isBeforeToday || isAfterMax;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleDateSelect(day)}
                            disabled={isDisabled}
                            className={`p-2 text-sm rounded-lg transition-all duration-300 font-medium ${!day ? 'bg-transparent cursor-default' :
                              isSelected ? 'bg-primary text-white shadow-md' :
                                isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                  isToday ? 'bg-blue-100 text-primary border border-blue-300 shadow-sm' :
                                    'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-2xl font-bold text-gray-900 mt-10 mb-6">
          Select Time
        </p>
        <div className='grid grid-cols-7 gap-3 mt-4'>
          {
            docSlots.length && docSlots[slotIndex].slice(0, 6).map((item, index) => (
              <div
                onClick={() => setSlotTime(item.time)}
                key={index}
                className={`text-sm font-semibold px-4 py-3 rounded-lg cursor-pointer text-center transition-all duration-300 shadow-md hover:shadow-lg ${item.time === slotTime ? 'bg-primary text-white shadow-lg' : 'border border-gray-200 bg-white hover:bg-blue-50'}`}
              >
                {item.time.toLowerCase()}
              </div>
            ))
          }

          {/* More Times Button with Dropdown */}
          {docSlots[slotIndex]?.length > 6 && (
            <div className="relative">
              <button
                onClick={() => setExpandMoreTimes(!expandMoreTimes)}
                className={`w-full text-sm font-semibold px-3 py-3 rounded-lg cursor-pointer transition-all duration-300 text-center shadow-md hover:shadow-lg ${slotTime && selectedFromMore ? 'bg-primary text-white shadow-lg' : 'border border-gray-200 bg-white hover:bg-blue-50 text-gray-700'}`}
              >
                {slotTime && selectedFromMore ? slotTime.toLowerCase() : 'More times'}
              </button>

              {/* Dropdown Menu */}
              {expandMoreTimes && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {docSlots[slotIndex].slice(6).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSlotTime(item.time);
                          setExpandMoreTimes(false);
                          setSelectedFromMore(true);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 ${item.time === slotTime ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-primary'}`}
                      >
                        {item.time.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={bookAppointment}
          className='bg-primary text-white text-base font-semibold px-14 py-4 rounded-full mt-8 mb-10 cursor-pointer shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 active:scale-95'
        >
          Book an appointment
        </button>
      </div>
      {/*---------------Listing Related Doctors--------------- */}
      <RelatedDoctors docId={docInfo._id} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment