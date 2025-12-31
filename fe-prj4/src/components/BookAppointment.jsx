import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { NumericFormat } from 'react-number-format';
import { assets } from '../assets/assets_frontend/assets';

const BookAppointment = () => {

    const { backendURL, token, getDoctorsData } = useContext(AppContext);
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const navigate = useNavigate();

    const [symptom, setSymptom] = useState('');
    const [docSlots, setDocSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState('');
    const [expandedTimes, setExpandedTimes] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [appointment, setAppointment] = useState(null);
    const [customDate, setCustomDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expandMoreTimes, setExpandMoreTimes] = useState(false);
    const [selectedFromMore, setSelectedFromMore] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (slotDate) => {
        const dateArr = slotDate.split('_');
        return dateArr[0] + " " + month[Number(dateArr[1]) - 1] + " " + dateArr[2];
    }

    const handleCustomDateChange = (e) => {
        const selectedDateStr = e.target.value; // Format: YYYY-MM-DD
        if (!selectedDateStr) return;

        const [year, month, day] = selectedDateStr.split('-').map(Number);

        // Tìm index của ngày này trong docSlots
        for (let i = 0; i < docSlots.length; i++) {
            if (docSlots[i].length > 0) {
                const slotDate = docSlots[i][0].datetime;
                if (slotDate.getDate() === day &&
                    slotDate.getMonth() + 1 === month &&
                    slotDate.getFullYear() === year) {
                    setSlotIndex(i);
                    setCustomDate(selectedDateStr);
                    setSlotTime('');
                    setSelectedFromMore(true);
                    setShowDatePicker(false);
                    break;
                }
            }
        }
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

            // Advance to the next 15-minute slot if not exactly on one
            let minutes = startTime.getMinutes();
            if (minutes % 15 !== 0) {
                startTime.setMinutes(Math.ceil(minutes / 15) * 15);
                if (startTime.getMinutes() === 60) {
                    startTime.setMinutes(0);
                    startTime.setHours(startTime.getHours() + 1);
                }
            }

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

                // Assuming all slots are available since no specific doctor
                timeSlots.push({
                    datetime: new Date(currentTime),
                    time: formattedTime,
                });

                currentTime.setMinutes(currentTime.getMinutes() + 15);
            }

            slots.push(timeSlots);
        }

        setDocSlots(slots);
    };

    const findDoctor = async () => {
        if (!token) {
            toast.warn('Login to book appointment.');
            localStorage.setItem('pendingSymptom', symptom);
            localStorage.setItem('pendingSlotIndex', slotIndex.toString());
            localStorage.setItem('pendingSlotTime', slotTime);
            localStorage.setItem('redirectAfterLogin', '/#findDoctor');
            return navigate('/login');
        }

        if (!symptom) {
            toast.warn('Please enter your symptoms.');
            return;
        }

        if (!slotTime) {
            toast.warn('Please select a time slot.');
            return;
        }

        try {
            const date = docSlots[slotIndex][0].datetime;

            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();

            const slotDate = day + "_" + month + "_" + year;
            const { data } = await axios.post(`${backendURL}/user/book-appointment-ai`,
                { symptom, slotDate, slotTime },
                { headers: { token } });

            if (data.success) {
                // console.log(data.appointmenet);
                setAppointment(data.appointment);
                setShowBooking(true);

                // delete localStorage items
                localStorage.removeItem('pendingSymptom');
                localStorage.removeItem('pendingSlotIndex');
                localStorage.removeItem('pendingSlotTime');
                localStorage.removeItem('redirectAfterLogin');
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || 'An error occurred');
        }
    };

    const bookAppointment = async () => {
        if (!token) {
            toast.warn('Login to book appointment.');
            return navigate('/login');
        }

        const docId = appointment?.docId;
        const slotDate = appointment?.slotDate;
        const slotTime = appointment?.slotTime;

        try {
            const { data } = await axios.post(`${backendURL}/user/booking-appointment`,
                { docId, slotDate, slotTime },
                { headers: { token } })

            if (data.success) {
                toast.success(data.message);
                getDoctorsData();
                setShowBooking(false);
                setAppointment(null);
                setSymptom('');
                navigate('/my-appointments');
            } else {
                toast.error(data.message)
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response.data.message)
        }
    };

    // restore pending data after login
    useEffect(() => {
        if (token && docSlots.length > 0) {
            const savedSymptom = localStorage.getItem('pendingSymptom');
            const savedSlotIndexStr = localStorage.getItem('pendingSlotIndex');
            const savedSlotTime = localStorage.getItem('pendingSlotTime');

            if (!savedSlotIndexStr && !savedSymptom && !savedSlotTime) return;

            // restore saved symptom
            if (savedSymptom) setSymptom(savedSymptom);

            // restore saved time and date
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
                // time ony save, check current date
                const currentDateSlots = docSlots[slotIndex];
                if (currentDateSlots?.some(slot => slot.time === savedSlotTime)) {
                    setSlotTime(savedSlotTime);
                }
            }

            // clear saved data
            localStorage.removeItem('pendingSymptom');
            localStorage.removeItem('pendingSlotIndex');
            localStorage.removeItem('pendingSlotTime');
        }
    }, [token, docSlots.length]);

    useEffect(() => {
        getAvailableSlots();
    }, []);

    useEffect(() => {
        setExpandedTimes(false);
    }, [slotIndex]);

    useEffect(() => {
        setExpandedTimes(false);
        if (!customDate) {
            setSlotTime('');
        }
    }, [slotIndex]);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <p className="text-2xl font-semibold mb-4" id='findDoctor'>Book Appointment</p>
            <div className="mb-6">
                <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Enter your symptoms here..."
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    required
                ></textarea>
            </div>
            {/*---------------Booking Slots--------------- */}
            <div className="font-medium text-gray-700">
                <p className="text-lg mb-2">Select Date </p>
                <div className="grid grid-cols-7 gap-4 mb-4 relative">
                    {docSlots.length &&
                        docSlots
                            .slice(0, 6)
                            .map((item, index) =>
                                item.length > 0 && (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSlotIndex(index);
                                            setCustomDate('');
                                            setShowDatePicker(false);
                                            setSelectedFromMore(false);
                                        }}
                                        className={`text-center py-4 px-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${slotIndex === index && !customDate ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
                                    >
                                        <p className="font-semibold">{daysOfWeek[item[0].datetime.getDay()]}</p>
                                        <p className="text-lg">{item[0].datetime.getDate()}</p>
                                    </div>
                                )
                            )}
                    {/* More Dates Button */}
                    {docSlots.length > 0 && (
                        <>
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`text-center py-4 px-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${customDate && selectedFromMore ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'}`}
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
                                        {/* <p className="text-xs text-gray-500">Select date</p> */}
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

                {/* Date Picker Modal - Removed as dropdown is now integrated */}
                <p className="text-lg mb-2">Select Time</p>
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {docSlots.length &&
                        docSlots[slotIndex]
                            .slice(0, 6)
                            .map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSlotTime(item.time)}
                                    className={`text-sm font-medium px-6 py-3 rounded-lg cursor-pointer text-center transition-all duration-200 shadow-sm hover:shadow-md ${item.time === slotTime ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
                                >
                                    {item.time.toLowerCase()}
                                </div>
                            ))}

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
                    onClick={findDoctor}
                    className="bg-primary text-white text-sm font-medium px-14 py-3 rounded-full cursor-pointer hover:bg-primary-dark transition duration-200"
                >
                    Find Doctor
                </button>
                {/* popup booking appointment */}
                {
                    showBooking && appointment && (
                        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                            <div className='bg-white rounded-2xl p-6 shadow-xl max-w-5xl w-full mx-4'>
                                {/*---------------Doctor Details--------------- */}
                                <div className='flex flex-col sm:flex-row gap-6'>
                                    <div className='flex-shrink-0'>
                                        <img
                                            className='bg-primary w-full sm:w-72 h-72 object-cover rounded-2xl shadow-md'
                                            src={appointment?.docData.image}
                                            alt=""
                                        />
                                    </div>

                                    <div className='flex-1 border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-lg'>
                                        {/*---------------Doctor Info--------------- */}
                                        <p className='flex items-center gap-2 text-xl sm:text-2xl font-semibold text-gray-900'>
                                            {appointment?.docData.name}
                                            <img className='w-5' src={assets.verified_icon} alt="" />
                                        </p>

                                        <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
                                            <p>
                                                {appointment?.docData.degree} - {appointment?.docData.speciality}
                                            </p>
                                            <button className='py-0.5 px-2 border text-xs rounded-full'>
                                                {appointment?.docData.experience}
                                            </button>
                                        </div>

                                        {/*---------------Doctor About--------------- */}
                                        <div>
                                            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                                                About <img src={assets.info_icon} alt="" />
                                            </p>
                                            <p className='text-sm text-gray-600 leading-relaxed max-w-[700px] mt-1'>
                                                {appointment?.docData.about}
                                            </p>
                                        </div>

                                        <p className='text-gray-600 font-medium mt-4'>
                                            Appointment fee:&nbsp;
                                            <span className='text-gray-800'>
                                                <NumericFormat
                                                    value={appointment?.docData.fees}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    displayType="text"
                                                    decimalScale={3}
                                                /> VND
                                            </span>
                                        </p>

                                        <p className='text-sm text-gray-600 mt-2'>
                                            <span className='font-medium text-neutral-700'>Date & Time: </span>
                                            {slotDateFormat(appointment?.slotDate)} | {appointment?.slotTime}
                                        </p>
                                    </div>
                                </div>

                                <div className='flex flex-col sm:flex-row justify-center gap-4 mt-6'>
                                    <button
                                        onClick={() => { setShowBooking(false); setAppointment(null); }}
                                        className='px-4 py-2 rounded-full bg-red-600 text-white cursor-pointer'
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={bookAppointment}
                                        className='px-4 py-2 rounded-full border text-sm text-primary bg-white cursor-pointer'
                                    >
                                        Book an appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default BookAppointment;