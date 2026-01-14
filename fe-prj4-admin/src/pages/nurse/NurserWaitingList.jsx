import React, { useContext, useState, useEffect } from 'react'
import { NurseContext } from '../../context/NurseContext';
import { toast } from "react-toastify";
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const NurserWaitingList = () => {

  const { backendNurseUrl, nToken, doctorsList, getDoctorsByNurseCategory, nurseProfile, getNurseProfile } = useContext(NurseContext);
  const { calculateAge, slotDateFormat } = useContext(AppContext);

  const [showWaitingList, setShowWaitingList] = useState(false);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const getWaitingPatients = async (doctorId, dateStr = '') => {
    try {
      const params = new URLSearchParams();
      if (dateStr) {
        params.append('date', dateStr);
      }
      const { data } = await axios.post(`${backendNurseUrl}/waiting-patients?${params.toString()}`, { docId: doctorId }, { headers: { nToken } });

      if (data.success) {
        setWaitingPatients(data.waitingPatients);
        console.log(data.waitingPatients);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while fetching waiting patients.");
    }
  }

  useEffect(() => {
    getDoctorsByNurseCategory();
    getNurseProfile();
  }, [nToken]);

  useEffect(() => {
    if (showWaitingList && selectedDoctor) {
      getWaitingPatients(selectedDoctor._id, selectedDate || '');
    }
  }, [selectedDate]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 dark:bg-gray-950 min-h-screen">
      {!showWaitingList ? (
        <>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Doctors List of {nurseProfile?.speciality}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Select a doctor to view waiting patients</p>
          </div>

          {/* Doctors Grid */}
          {doctorsList && doctorsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorsList.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowWaitingList(true);
                    setSelectedDate('');
                    getWaitingPatients(doctor._id);
                  }}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200 dark:border-gray-800"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">{doctor.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.speciality}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{doctor.experience}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No doctors found</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Back Button & Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => {
                setShowWaitingList(false);
                setSelectedDoctor(null);
                setWaitingPatients([]);
                setSelectedDate('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Doctors
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Waiting Patients
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {selectedDoctor?.name}
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Date Input */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40 transition-all cursor-pointer shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
                />
              </div>

              {/* Clear Button */}
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {/* Active Filter Badge */}
            {selectedDate && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Patients Table Container */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1.5fr_2fr_1fr] gap-1 py-4 px-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Patient</p>
              <p className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Age</p>
              <p className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</p>
              <p className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date & Time</p>
              <p className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</p>
            </div>

            {/* Table Body */}
            {waitingPatients && waitingPatients.length > 0 ? (
              <div className="max-h-[70vh] overflow-y-auto">
                {waitingPatients.map((item, index) => (
                  <div
                    className="flex flex-wrap justify-between max-sm:gap-4 max-sm:text-sm sm:grid grid-cols-[0.5fr_2fr_1fr_1.5fr_2fr_1fr] gap-1 items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                    key={index}
                  >
                    {/* Index */}
                    <p className="max-sm:hidden font-semibold text-gray-600 dark:text-gray-400">{index + 1}</p>

                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                        src={item.userData.image}
                        alt={item.userData.name}
                      />
                      <p className="font-medium text-gray-900 dark:text-white">{item.userData.name}</p>
                    </div>

                    {/* Age */}
                    <p className="max-sm:hidden text-center font-medium text-gray-700 dark:text-gray-300">
                      {calculateAge(item.userData.dob)} yrs
                    </p>

                    {/* Phone */}
                    <p className="text-center font-medium text-gray-700 dark:text-gray-300">{item.userData.phone}</p>

                    {/* Date & Time */}
                    <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {slotDateFormat(item.slotDate)} <br className="sm:hidden" /> {item.slotTime}
                    </p>

                    {/* Status */}
                    <div className="flex justify-center">
                      {item.isCompleted === true || item.isCompleted === 'completed' ? (
                        <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Done</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.5a1 1 0 002 0V7zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No waiting patients</p>
                <p className="text-sm">Check back later</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NurserWaitingList