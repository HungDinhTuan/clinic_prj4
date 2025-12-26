import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useEffect } from 'react';
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

const MyAppointments = () => {
  const { backendURL, token, getDoctorsData } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);

  const [showConfrim, setShowConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [qrCodePayment, setQRCodePayment] = useState('');
  const [contentPayment, setContentPayment] = useState('');
  const [amount, setAmount] = useState('');
  const [isCheckingPayment, setIsChekingPayment] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300); // countdown 5 mintunes for payment

  const paymentInterval = useRef(null);
  const countdownInternal = useRef(null);

  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArr = slotDate.split('_');
    return dateArr[0] + " " + month[Number(dateArr[1]) - 1] + " " + dateArr[2];
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/user/my-appointments`, { headers: { token } })

      if (data.success) {
        setAppointments(data.appointments.reverse())
        //console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message);
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.put(`${backendURL}/user/cancel-appointment`, { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message);
    }
  }

  const checkTransition = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      const { data } = await axios.post(`${backendURL}/payment/check-transition`, { appointmentId }, { headers: { token } })

      if (data.qrCodeURL) {
        setQRCodePayment(data.qrCodeURL);
        setContentPayment(data.content);
        setAmount(data.amount);
      }

      if (data.payment === true) {
        toast.success(data.message);
        closePaymentPopup();
        getUserAppointments();
        return;
      }

      if (data.success === false && !data.alreadyPaid) {
        // toast.info("Waiting payment...")
      } else {
        // toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
      // toast.error(e.response.data.message);
    }
  }

  const openPaymentPopup = async (appointmentId) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    if (appointment.payment) {
      toast.info("Payment successful.")
      return;
    }

    setSelectedId(appointmentId);
    setShowPayment(true);
    setIsChekingPayment(true);

    setQRCodePayment('');
    setContentPayment('');
    setAmount('');

    try {
      await checkTransition(appointmentId);
    } finally {
      setIsChekingPayment(false)
    }

    if (paymentInterval.current) {
      clearInterval(paymentInterval.current);
      paymentInterval.current = null;
    }

    if (countdownInternal.current) {
      clearInterval(countdownInternal.current);
      countdownInternal.current = null;
    }

    // check transition per 5s
    paymentInterval.current = setInterval(() => {
      checkTransition(appointmentId)
    }, 5000)

    // countdown
    countdownInternal.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInternal.current);
          clearInterval(paymentInterval.current);
          toast.warning("Time up. Please try again");
          closePaymentPopup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const closePaymentPopup = () => {
    setShowPayment(false);
    setSelectedId(null);
    setQRCodePayment('');
    setContentPayment('');
    setAmount('');
    setTimeLeft(300);

    if (paymentInterval.current) {
      clearInterval(paymentInterval.current);
      paymentInterval.current = null;
    }
    if (countdownInternal.current) {
      clearInterval(countdownInternal.current);
      countdownInternal.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (paymentInterval.current) {
        clearInterval(paymentInterval.current);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token])

  return appointments && (
    <div>
      <div className="flex items-center justify-between mt-8 pb-2 border-b">
        <p className="font-medium text-zinc-700">My Appointment</p>
        <p className="text-sm text-primary hover:underline cursor-pointer">
          <a href="">Medical Record</a>
        </p>
      </div>
      <div>
        {
          appointments.map((item, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='font-medium text-neutral-800 mt-1'>
                  Fee :
                  <span className='text-primary font-semibold ml-1'>
                    <NumericFormat
                      value={item.amount}
                      thousandSeparator="."
                      decimalSeparator=","
                      displayType="text"
                      decimalScale={3} /> VND
                  </span>
                </p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium '>Date & Time: </span>{slotDateFormat(item.slotDate)} | {item.slotTime} </p>
              </div>
              {
                item.payment
                  ? <div className='flex flex-col gap-2 justify-end'>
                    <button className='text-sm text-white bg-primary text-center sm:min-w-48 py-2 border rounded'>Payment successful</button>
                  </div>
                  : <div className='flex flex-col gap-2 justify-end'>
                    {/*onClick={() => openPaymentPopup(item._id)}*/}
                    <button onClick={() => openPaymentPopup(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer'>Pay Online</button>
                    <button onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer '>Cancel appointment</button>
                  </div>
              }
            </div>
          ))
        }
      </div>
      {/*popup confirm cancel*/}
      {showConfrim && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-80 shadow-lg animate-fadeIn'>
            <h2 className='text-lg font-semibold text-neutral-800 mb-3'>
              Confirm Cancellation
            </h2>
            <p className='text-sm text-zinc-600 mb-5'>
              Are you sure?
            </p>
            <div className='flex justify-end gap-3'>
              <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200 transition cursor-pointer' onClick={() => setShowConfirm(false)}>No</button>
              <button className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer' onClick={() => { cancelAppointment(selectedId); setShowConfirm(false); }}>Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
      {/*popup payment*/}
      {
        showPayment && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white relative p-6 rounded-2xl shadow-xl animate-fadeIn flex flex-col items-center gap-5 w-80 sm:w-96'>
              <div className='absolute top-0 left-0 w-full h-1.5 bg-gray-200 rounded-t-2xl overflow-hidden'>
                <div
                  className='h-full bg-red-500 transition-all duration-1000'
                  style={{ width: `${(timeLeft / 300) * 100}%` }}
                />
              </div>
              <h3 className='text-xl font-semibold text-neutral-800 mt-2'>QR Code Payment</h3>
              <p className='text-xs text-gray-500 -mt-2 mb-1'>Please transfer the correct amount</p>
              {/* Countdown clock */}
              <div className="text-center">
                <div className="text-xl font-semibold text-red-600 font-mono tracking-widest">
                  {formatTime(timeLeft)}
                </div>
                <p className='text-xs text-gray-500 mt-1'>Close after time up.</p>
              </div>
              {
                isCheckingPayment && !qrCodePayment
                  ? (
                    <div className="w-56 h-56 flex items-center justify-center bg-gray-100 rounded-xl shadow-inner">
                      <p className="text-gray-500 animate-pulse">Generating QR...</p>
                    </div>
                  )
                  : (
                    qrCodePayment && <img className='w-90 h-90 rounded-xl border border-gray-200 shadow-sm object-contain' src={qrCodePayment} />
                  )
              }
              <div className='text-center text-sm text-gray-700'>
                {/* <p className='font-medium text-neutral-800'>
                  Content:
                  <span className='text-gray-600 ml-1'>{contentPayment}</span>
                </p> */}
                <p className='font-medium text-neutral-800 mt-1'>
                  Amount:
                  <span className='text-primary font-semibold ml-1'>
                    <NumericFormat
                      value={amount}
                      thousandSeparator="."
                      decimalSeparator=","
                      displayType="text"
                      decimalScale={3} /> VND
                  </span>
                </p>
                <button className='mt-4 cursor-pointer px-4 py-1 rounded border bg-white text-primary hover:bg-red-700 transition hover:text-white hover:border-red-700' onClick={closePaymentPopup}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default MyAppointments
