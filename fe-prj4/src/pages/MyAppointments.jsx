import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useEffect } from 'react';
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import TabNavigation from '../components/TabNavigation';

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
    <div className='max-w-5xl mx-auto p-4'>
      <TabNavigation />
      <div className='space-y-4 mt-6'>
        {
          appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6' key={index}>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='flex-shrink-0'>
                    <img className='w-40 h-40 rounded-lg bg-blue-50 object-cover shadow-sm' src={item.docData.image} alt={item.docData.name} />
                  </div>
                  <div className='flex-1 text-base text-gray-700'>
                    <p className='text-xl font-bold text-neutral-900'>👨‍⚕️ {item.docData.name}</p>
                    <p className='text-primary font-semibold mt-1'>{item.docData.speciality}</p>
                    <p className='font-semibold text-neutral-900 mt-3'>
                      💰 Appointment Fee:
                      <span className='text-primary font-bold ml-2'>
                        <NumericFormat
                          value={item.amount}
                          thousandSeparator="."
                          decimalSeparator=","
                          displayType="text"
                          decimalScale={3} /> VND
                      </span>
                    </p>
                    {
                      Object.keys(item?.userDataNotSign || {}).length > 0 && (
                        <div className='mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200'>
                          <p className='text-sm font-bold text-gray-900 mb-3'>
                            👤 Patient Information
                          </p>
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='font-semibold text-gray-700'>Name:</span>
                              <span className='text-gray-900 font-medium'>{item?.userDataNotSign.name}</span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='font-semibold text-gray-700'>Email:</span>
                              <span className='text-gray-900 font-medium'>{item?.userDataNotSign.email}</span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='font-semibold text-gray-700'>Phone:</span>
                              <span className='text-gray-900 font-medium'>{item?.userDataNotSign.phone}</span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='font-semibold text-gray-700'>Gender:</span>
                              <span className='text-gray-900 font-medium'>{item?.userDataNotSign.gender}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    <div className='mt-3 bg-gray-50 p-3 rounded-lg'>
                      <p className='font-semibold text-gray-800'>📍 Address:</p>
                      <p className='text-sm text-gray-600 mt-1'>{item.docData.address.line1}</p>
                      <p className='text-sm text-gray-600'>{item.docData.address.line2}</p>
                    </div>
                    <p className='text-sm text-gray-700 font-semibold mt-3'>
                      📅 <span className='text-neutral-800'>{slotDateFormat(item.slotDate)} | {item.slotTime}</span>
                    </p>
                  </div>
                  <div className='flex flex-col gap-2 justify-end sm:min-w-56'>
                    {
                      item.payment
                        ? (
                          <button className='w-full px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all duration-200 cursor-default shadow-sm'>
                            ✓ Payment Successful
                          </button>
                        )
                        : (
                          <>
                            <button
                              onClick={() => openPaymentPopup(item._id)}
                              className='w-full px-3 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md'
                            >
                              💳 Pay Online
                            </button>
                            <button
                              onClick={() => { setSelectedId(item._id); setShowConfirm(true); }}
                              className='w-full px-3 py-2 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md'
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )
                    }
                  </div>
                </div>
              </div>
            ))) : (
            <div className='text-center py-12'>
              <p className='text-xl text-gray-500'>No appointments yet</p>
              <p className='text-sm text-gray-400 mt-2'>Book an appointment to get started</p>
            </div>
          )}
      </div>
      {/*popup confirm cancel*/}
      {showConfrim && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-8 w-full max-w-md shadow-2xl'>
            <h2 className='text-2xl font-bold text-neutral-900 mb-3'>
              ⚠️ Confirm Cancellation
            </h2>
            <p className='text-base text-gray-600 mb-6'>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                className='px-6 py-2.5 rounded-lg border-2 border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer'
                onClick={() => setShowConfirm(false)}
              >
                No, Keep It
              </button>
              <button
                className='px-6 py-2.5 rounded-lg bg-red-600 text-white text-base font-semibold hover:bg-red-700 transition-all cursor-pointer shadow-sm'
                onClick={() => { cancelAppointment(selectedId); setShowConfirm(false); }}
              >
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
      {/*popup payment*/}
      {
        showPayment && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>
              {/* Progress bar */}
              <div className='absolute top-0 left-0 w-full h-1 bg-gray-200'>
                <div
                  className='h-full bg-red-500 transition-all duration-1000'
                  style={{ width: `${(timeLeft / 300) * 100}%` }}
                />
              </div>

              <div className='p-8 flex flex-col items-center gap-6'>
                <h3 className='text-2xl font-bold text-neutral-900 mt-2'>💳 QR Code Payment</h3>
                <p className='text-sm text-gray-600 text-center'>Please scan and transfer the exact amount</p>

                {/* Countdown */}
                <div className="text-center p-4 bg-red-50 rounded-lg w-full">
                  <div className="text-3xl font-bold text-red-600 font-mono tracking-widest">
                    {formatTime(timeLeft)}
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>Popup closes automatically when time expires</p>
                </div>

                {/* QR Code */}
                {
                  isCheckingPayment && !qrCodePayment
                    ? (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-xl shadow-inner">
                        <div className="text-center">
                          <div className="animate-spin text-primary text-3xl mb-2">⏳</div>
                          <p className="text-gray-600 font-medium">Generating QR Code...</p>
                        </div>
                      </div>
                    )
                    : (
                      qrCodePayment && (
                        <div className='border-4 border-gray-300 rounded-xl overflow-hidden shadow-md'>
                          <img className='w-80 h-80 object-contain' src={qrCodePayment} alt="QR Code" />
                        </div>
                      )
                    )
                }

                {/* Amount Info */}
                <div className='text-center bg-blue-50 p-4 rounded-lg w-full'>
                  <p className='text-sm text-gray-700 font-medium'>
                    💰 Transfer Amount:
                  </p>
                  <p className='text-2xl font-bold text-primary mt-2'>
                    <NumericFormat
                      value={amount}
                      thousandSeparator="."
                      decimalSeparator=","
                      displayType="text"
                      decimalScale={3} /> VND
                  </p>
                </div>

                {/* Cancel Button */}
                <button
                  className='w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer'
                  onClick={closePaymentPopup}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default MyAppointments
