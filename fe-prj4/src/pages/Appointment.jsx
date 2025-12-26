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

  const fetchDocInfo = async () => {
    const docInfo = doctors?.find(doc => doc._id === docId) ?? null;
    setDocInfo(docInfo);
  };

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
        <div className='grid grid-cols-7 gap-4 mt-4'>
          {
            docSlots.length && docSlots.slice(0, expandedDates ? docSlots.length : 7).map((item, index) => (
              item.length > 0 && (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-4 px-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${slotIndex === index ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
                  key={index}
                >
                  <p className='font-semibold'>{daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p className='text-lg'>{item[0].datetime.getDate()}</p>
                </div>
              )
            ))
          }
        </div>
        {!expandedDates && docSlots.length > 7 && (
          <button
            onClick={() => setExpandedDates(true)}
            className='bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-full mt-4 cursor-pointer hover:bg-gray-300 transition duration-200'
          >
            More Dates
          </button>
        )}
        <p className="text-lg mt-8 mb-3">
          Select Time
        </p>
        <div className='grid grid-cols-7 gap-4 mt-6'>
          {
            docSlots.length && docSlots[slotIndex].slice(0, expandedTimes ? docSlots[slotIndex].length : 7).map((item, index) => (
              <div
                onClick={() => setSlotTime(item.time)}
                key={index}
                className={`text-sm font-medium px-6 py-3 rounded-lg cursor-pointer text-center transition-all duration-200 shadow-sm hover:shadow-md ${item.time === slotTime ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 bg-white hover:bg-gray-50'}`}
              >
                {item.time.toLowerCase()}
              </div>
            ))
          }
        </div>
        {!expandedTimes && docSlots[slotIndex]?.length > 7 && (
          <button
            onClick={() => setExpandedTimes(true)}
            className='bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-full mt-4 mr-2.5 cursor-pointer hover:bg-gray-300 transition duration-200'
          >
            More Times
          </button>
        )}
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