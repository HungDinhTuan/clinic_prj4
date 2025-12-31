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
  const { doctors, backendURL, token, getDoctorsData } = useContext(AppContext);
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
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchDocInfo = async () => {
    const docInfo = doctors?.find(doc => doc._id === docId) ?? null;
    setDocInfo(docInfo);
  };

  const getDisplayDateText = () => {
    if (!customDate) return 'More Dates';

    const [year, month, day] = customDate.split('-').map(Number);
    const dayOfWeek = daysOfWeek[new Date(year, month - 1, day).getDay()];
    return `${dayOfWeek}\n${day}`;
  };

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

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment.')
      return navigate('/login');
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(`${backendURL}/user/booking-appointment`,
        { docId, slotDate, slotTime },
        { headers: { token } })

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message)
    }
  }

  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  useEffect(() => {
    setExpandedTimes(false);
    if (!customDate) {
      setSlotTime('');
    }
  }, [slotIndex]);

  return docInfo && (
    <div>
      {/*---------------Doctor Details--------------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo?.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/*---------------Doctor Info : name, degree, speciality, experience--------------- */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo?.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo?.degree} - {docInfo?.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo?.experience}</button>
          </div>
          {/*---------------Doctor Abouts--------------- */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo?.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee:&#160;
            <span className='text-gray-800'>
              <NumericFormat
                value={docInfo?.fees}
                thousandSeparator="."
                decimalSeparator=","
                displayType="text"
                decimalScale={3} /> VND.</span>
          </p>
        </div>
      </div>
      {/*---------------Booking Slots--------------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p className="text-lg mb-2">Select Date </p>
        <div className='grid grid-cols-7 gap-4 mt-4 relative'>
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
                  className={`text-center py-4 px-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${slotIndex === index && !customDate ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
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
                className={`text-center py-4 px-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${customDate && selectedFromMore ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
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
                <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
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
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        ← Prev
                      </button>
                      <span className="text-sm font-semibold text-gray-900">
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
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Next →
                      </button>
                    </div>

                    {/* Days of week headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
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
                            className={`p-2 text-sm rounded transition-colors ${!day ? 'bg-transparent cursor-default' :
                              isSelected ? 'bg-primary text-white font-medium' :
                                isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                  isToday ? 'bg-blue-100 text-blue-900 font-medium' :
                                    'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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

        <p className="text-lg mt-8 mb-3">
          Select Time
        </p>
        <div className='grid grid-cols-7 gap-4 mt-6'>
          {
            docSlots.length && docSlots[slotIndex].slice(0, 6).map((item, index) => (
              <div
                onClick={() => setSlotTime(item.time)}
                key={index}
                className={`text-sm font-medium px-6 py-3 rounded-lg cursor-pointer text-center transition-all duration-200 shadow-sm hover:shadow-md ${item.time === slotTime ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
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
                className={`w-full text-sm font-medium px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 text-center ${slotTime && selectedFromMore ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'}`}
              >
                {slotTime && selectedFromMore ? slotTime.toLowerCase() : 'More times'}
              </button>

              {/* Dropdown Menu */}
              {expandMoreTimes && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {docSlots[slotIndex].slice(6).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSlotTime(item.time);
                          setExpandMoreTimes(false);
                          setSelectedFromMore(true);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${item.time === slotTime ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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
          className='bg-primary text-white text-sm font-medium px-14 py-3 rounded-full my-6 cursor-pointer hover:bg-primary-dark transition duration-200'
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