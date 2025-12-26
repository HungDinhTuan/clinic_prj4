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
    const [expandedDates, setExpandedDates] = useState(false);
    const [expandedTimes, setExpandedTimes] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [appointment, setAppointment] = useState(null);
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (slotDate) => {
        const dateArr = slotDate.split('_');
        return dateArr[0] + " " + month[Number(dateArr[1]) - 1] + " " + dateArr[2];
    }

    const getAvailableSlots = async () => {
        const slots = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const endTime = new Date(currentDate);
            endTime.setHours(18, 0, 0, 0);

            let startTime = new Date(currentDate);
            if (i === 0) {
                startTime.setHours(today.getHours(), today.getMinutes(), 0, 0);
            } else {
                startTime.setHours(8, 0, 0, 0);
            }

            if (startTime.getHours() < 8) {
                startTime.setHours(8, 0, 0, 0);
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

                currentTime.setMinutes(currentTime.getMinutes() + 30);
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
                const savedIndex= Number(savedSlotIndexStr);
                if(docSlots[savedIndex] && docSlots[savedIndex].length > 0){
                    setSlotIndex(savedIndex);

                    if (savedSlotTime) {
                        const isValidTime = docSlots[savedIndex].some(slot => slot.time === savedSlotTime);
                        if (isValidTime) {
                            setSlotTime(savedSlotTime);
                        }else{
                            setSlotTime('');
                        }
                    }
                }
            }else if (savedSlotTime) {
                // time ony save, check current date
                const currentDateSlots = docSlots[slotIndex];
                if(currentDateSlots?.some(slot => slot.time === savedSlotTime)){
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
        if (!localStorage.getItem('pendingSlotTime')) {
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
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {docSlots.length &&
                        docSlots
                            .slice(0, expandedDates ? docSlots.length : 7)
                            .map((item, index) =>
                                item.length > 0 && (
                                    <div
                                        key={index}
                                        onClick={() => setSlotIndex(index)}
                                        className={`text-center py-4 px-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${slotIndex === index ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
                                    >
                                        <p className="font-semibold">{daysOfWeek[item[0].datetime.getDay()]}</p>
                                        <p className="text-lg">{item[0].datetime.getDate()}</p>
                                    </div>
                                )
                            )}
                </div>
                {!expandedDates && docSlots.length > 7 && (
                    <button
                        onClick={() => setExpandedDates(true)}
                        className="bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-full mb-4 cursor-pointer hover:bg-gray-300 transition duration-200"
                    >
                        More Dates
                    </button>
                )}
                <p className="text-lg mb-2">Select Time</p>
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {docSlots.length &&
                        docSlots[slotIndex]
                            .slice(0, expandedTimes ? docSlots[slotIndex].length : 7)
                            .map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSlotTime(item.time)}
                                    className={`text-sm font-medium px-6 py-3 rounded-lg cursor-pointer text-center transition-all duration-200 shadow-sm hover:shadow-md ${item.time === slotTime ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
                                >
                                    {item.time.toLowerCase()}
                                </div>
                            ))}
                </div>
                {!expandedTimes && docSlots[slotIndex]?.length > 7 && (
                    <button
                        onClick={() => setExpandedTimes(true)}
                        className="bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-full mb-4 mr-2.5 cursor-pointer hover:bg-gray-300 transition duration-200"
                    >
                        More Times
                    </button>
                )}
                <button
                    onClick={findDoctor}
                    className="bg-primary text-white text-sm font-medium px-14 py-3 rounded-full cursor-pointer hover:bg-primary-dark transition duration-200"
                >
                    Find Doctor
                </button>
            </div>
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
    );
};

export default BookAppointment;