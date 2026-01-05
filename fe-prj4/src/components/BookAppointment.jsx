import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { NumericFormat } from 'react-number-format';
import { assets } from '../assets/assets_frontend/assets';

const BookAppointment = () => {

    const { backendURL, token, getDoctorsData, userData } = useContext(AppContext);

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

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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
            localStorage.setItem('pendingUserNotSigned', JSON.stringify(userNotSigned));
            localStorage.setItem('pendingBookForAnother', JSON.stringify(bookForAnother));
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

            // Prepare request body
            const requestBody = {
                symptom,
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

            const { data } = await axios.post(`${backendURL}/user/find-doctor`,
                requestBody,
                { headers: { token } });

            if (data.success) {
                setAppointment(data.appointment);
                console.log(data.appointment);
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
            // Prepare request body with required fields
            const requestBody = {
                docId,
                slotDate,
                slotTime
            };

            // Add non-signed user data if booking for another
            if (bookForAnother && appointment?.userDataNotSign) {
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
                setShowBooking(false);
                setAppointment(null);
                setSymptom('');
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
            toast.error(e.response?.data?.message || 'An error occurred')
        }
    };

    // restore pending data after login
    useEffect(() => {
        if (token && docSlots.length > 0) {
            const savedSymptom = localStorage.getItem('pendingSymptom');
            const savedSlotIndexStr = localStorage.getItem('pendingSlotIndex');
            const savedSlotTime = localStorage.getItem('pendingSlotTime');
            const savedUserNotSigned = localStorage.getItem('pendingUserNotSigned');
            const savedBookForAnother = localStorage.getItem('pendingBookForAnother');

            if (!savedSlotIndexStr && !savedSymptom && !savedSlotTime && !savedUserNotSigned && !savedBookForAnother) return;

            // restore saved symptom
            if (savedSymptom) setSymptom(savedSymptom);

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
            localStorage.removeItem('pendingUserNotSigned');
            localStorage.removeItem('pendingBookForAnother');
            localStorage.removeItem('redirectAfterLogin');
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
            <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-2xl font-semibold" id='findDoctor'>Book Appointment</p>
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
                                        address2: ''
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
                                + Book for Another
                            </button>
                        )
                }
            </div>
            {
                bookForAnother && (
                    <div className="mb-6 p-6 border-2 border-blue-200 rounded-lg bg-white shadow-sm">
                        <p className="font-semibold text-gray-800 mb-4 text-lg">📋 Enter Patient's Information</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">👤 Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                                    placeholder='Enter full name'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, name: e.target.value })}
                                    value={userNotSigned.name}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">🎂 Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, birthday: e.target.value })}
                                    value={userNotSigned.birthday}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">📧 Email</label>
                                <input
                                    type="email"
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                                    placeholder='Enter email address'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, email: e.target.value })}
                                    value={userNotSigned.email}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">📞 Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                                    placeholder='Enter phone number'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, phone: e.target.value })}
                                    value={userNotSigned.phone}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">🏠 Address</label>
                                <input
                                    type="text"
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition mb-2'
                                    placeholder='Street address'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, address1: e.target.value })}
                                    value={userNotSigned.address1}
                                />
                                <input
                                    type="text"
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition'
                                    placeholder='City, province (optional)'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, address2: e.target.value })}
                                    value={userNotSigned.address2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">👥 Gender</label>
                                <select
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white cursor-pointer'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, gender: e.target.value })}
                                    value={userNotSigned.gender}
                                >
                                    <option value="">-- Select Gender --</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">📱 Relationship</label>
                                <select
                                    required
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white cursor-pointer'
                                    onChange={(e) => setUserNotSigned({ ...userNotSigned, relationship: e.target.value })}
                                    value={userNotSigned.relationship}
                                >
                                    <option value="">-- Select Relationship --</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Child">Child</option>
                                    <option value="Relative">Relative</option>
                                    <option value="Friend">Friend</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="mb-6">
                <textarea
                    className="w-full p-4 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                            <div className='bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto overflow-hidden'>
                                {/* Close Button */}
                                <button
                                    onClick={() => { setShowBooking(false); setAppointment(null); }}
                                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10'
                                >
                                    ×
                                </button>

                                {/*---------------Doctor Details--------------- */}
                                <div className='flex flex-col sm:flex-row gap-8 p-8'>
                                    <div className='flex-shrink-0'>
                                        <img
                                            className='bg-primary w-full sm:w-80 h-96 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300'
                                            src={appointment?.docData.image}
                                            alt={appointment?.docData.name}
                                        />
                                    </div>

                                    <div className='flex-1 flex flex-col justify-center'>
                                        {/*---------------Doctor Info--------------- */}
                                        <div className='space-y-6'>
                                            <div>
                                                <p className='flex items-center gap-3 text-3xl font-bold text-gray-900'>
                                                    {appointment?.docData.name}
                                                    <img className='w-6 h-6' src={assets.verified_icon} alt="Verified" />
                                                </p>

                                                <div className='flex flex-wrap items-center gap-3 text-sm mt-3 text-gray-600'>
                                                    <p className='font-semibold text-gray-800'>
                                                        {appointment?.docData.degree} - {appointment?.docData.speciality}
                                                    </p>
                                                    <button className='py-1 px-3 border border-gray-300 text-xs rounded-full font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-300'>
                                                        {appointment?.docData.experience}
                                                    </button>
                                                </div>
                                            </div>

                                            {/*---------------Doctor About--------------- */}
                                            <div className='pt-6 border-t border-gray-200'>
                                                <p className='flex items-center gap-2 text-sm font-bold text-gray-900 mb-3'>
                                                    <img src={assets.info_icon} alt="" />
                                                    About
                                                </p>
                                                <p className='text-sm text-gray-600 leading-relaxed max-w-[700px]'>
                                                    {appointment?.docData.about}
                                                </p>
                                            </div>

                                            {/*---------------Appointment Details--------------- */}
                                            {/* information another */}
                                            {
                                                bookForAnother && appointment?.userDataNotSign && (
                                                    <div className='pt-6 border-t border-gray-200'>
                                                        <p className='flex items-center gap-2 text-sm font-bold text-gray-900 mb-4'>
                                                            👤 Patient Information
                                                        </p>
                                                        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 space-y-3 border border-blue-200'>
                                                            <div className='flex items-center justify-between'>
                                                                <span className='font-semibold text-gray-700'>Name:</span>
                                                                <span className='text-gray-900 font-medium'>{appointment?.userDataNotSign.name}</span>
                                                            </div>
                                                            <div className='border-t border-blue-200'></div>
                                                            <div className='flex items-center justify-between'>
                                                                <span className='font-semibold text-gray-700'>Email:</span>
                                                                <span className='text-gray-900 font-medium'>{appointment?.userDataNotSign.email}</span>
                                                            </div>
                                                            <div className='border-t border-blue-200'></div>
                                                            <div className='flex items-center justify-between'>
                                                                <span className='font-semibold text-gray-700'>Phone:</span>
                                                                <span className='text-gray-900 font-medium'>{appointment?.userDataNotSign.phone}</span>
                                                            </div>
                                                            <div className='border-t border-blue-200'></div>
                                                            <div className='flex items-center justify-between'>
                                                                <span className='font-semibold text-gray-700'>Gender:</span>
                                                                <span className='text-gray-900 font-medium'>{appointment?.userDataNotSign.gender}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            <div className='space-y-4 pt-6 border-t border-gray-200'>
                                                <div className='flex items-center justify-between'>
                                                    <p className='text-gray-700 font-semibold'>
                                                        Appointment fee:
                                                    </p>
                                                    <p className='text-2xl font-bold text-primary'>
                                                        <NumericFormat
                                                            value={appointment?.docData.fees}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            displayType="text"
                                                            decimalScale={3}
                                                        /> VND
                                                    </p>
                                                </div>

                                                <div className='bg-blue-50 rounded-lg p-4'>
                                                    <p className='text-sm text-gray-700'>
                                                        <span className='font-bold text-gray-900'>📅 Date & Time: </span>
                                                        <span className='font-semibold text-primary'>{slotDateFormat(appointment?.slotDate)} | {appointment?.slotTime}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/*---------------Action Buttons--------------- */}
                                <div className='flex flex-col sm:flex-row justify-center gap-4 p-8 border-t border-gray-200 bg-gray-50'>
                                    <button
                                        onClick={() => { setShowBooking(false); setAppointment(null); }}
                                        className='px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100 transition-all duration-300 active:scale-95 hover:shadow-md'
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={bookAppointment}
                                        className='px-8 py-3 rounded-full bg-primary text-white font-semibold cursor-pointer shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 active:scale-95'
                                    >
                                        Book Appointment
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