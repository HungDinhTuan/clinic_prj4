import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';

const DoctorWaitingTestsResult = () => {

    const { dToken, backendDocUrl, waitingTestsResults, getWaitingTestsResults } = useContext(DoctorContext);
    const { calculateAge, slotDateFormat } = useContext(AppContext);
    const [selectedTest, setSelectedTest] = useState(null);
    const [showTestDetail, setShowTestDetail] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        getWaitingTestsResults(selectedDate);
    }, [dToken, selectedDate]);

    const openTestDetail = (test) => {
        setSelectedTest(test);
        setShowTestDetail(true);
    }

    const closeTestDetail = () => {
        setShowTestDetail(false);
        setSelectedTest(null);
    }

    return (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 dark:bg-gray-950 min-h-screen'>
            {/* Header Section */}
            <div className='mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2'>Test Results</h1>
                <p className='text-gray-600 dark:text-gray-400'>View and manage completed medical test results</p>
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
                    <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Test Name</p>
                    <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Testing Staff</p>
                    <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Department</p>
                    <p className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Details</p>
                </div>

                {/* Table Body */}
                {
                    waitingTestsResults && waitingTestsResults.length > 0 ? (
                        <div className='max-h-[70vh] overflow-y-auto'>
                            {waitingTestsResults.map((item, index) => (
                                <React.Fragment key={index}>
                                    {item.orderedTests && item.orderedTests.length > 0 ? (
                                        item.orderedTests.map((test, testIndex) => (
                                            <div
                                                className='flex flex-wrap justify-between max-sm:gap-4 max-sm:text-sm sm:grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_2fr_2fr_2fr_2fr_1fr] gap-1 items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors duration-150'
                                                key={testIndex}
                                            >
                                                {/* Row Number */}
                                                <p className='max-sm:hidden font-semibold text-gray-600 dark:text-gray-400'>{index + testIndex + 1}</p>

                                                {/* Patient Name */}
                                                <div className='flex items-center gap-3'>
                                                    <img className='w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700' src={item.userData?.image || 'https://via.placeholder.com/40'} alt={item.userData?.name || 'Patient'} />
                                                    <p className='font-medium text-gray-900 dark:text-white'>{item.userData?.name || 'N/A'}</p>
                                                </div>

                                                {/* Age */}
                                                <p className='max-sm:hidden text-center font-medium text-gray-700 dark:text-gray-300'>{calculateAge(item.userData?.dob) || 'N/A'} yrs</p>

                                                {/* Phone */}
                                                <p className='text-center font-medium text-gray-700 dark:text-gray-300'>{item.userData?.phone || 'N/A'}</p>

                                                {/* Date & Time */}
                                                <p className='text-center text-sm text-gray-700 dark:text-gray-300'>{slotDateFormat(item.slotDate)} <br className='sm:hidden' /> {item.slotTime}</p>

                                                {/* Test Name */}
                                                <p className='text-center text-sm font-medium text-gray-900 dark:text-white'>{test.medicalTestData?.name || 'N/A'}</p>

                                                {/* Testing Staff Name */}
                                                <p className='text-center text-sm text-gray-700 dark:text-gray-300'>{test.testingStaffData?.name || 'N/A'}</p>

                                                {/* Department */}
                                                <p className='text-center text-sm text-gray-700 dark:text-gray-300'>{test.testingStaffData?.department || 'N/A'}</p>

                                                {/* View Details Button */}
                                                <div className='flex justify-center'>
                                                    <button
                                                        onClick={() => openTestDetail(test)}
                                                        className='px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all'
                                                        title='View Details'
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : null}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
                            <p className='text-lg font-medium'>No test results yet</p>
                            <p className='text-sm'>Check back when tests are completed</p>
                        </div>
                    )
                }
            </div>

            {/* Test Detail Popup */}
            {
                showTestDetail && selectedTest && (
                    <div className='fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4'>
                        <div className='bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-2xl shadow-2xl dark:shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800'>
                            {/* Header */}
                            <div className='flex items-center justify-between mb-6'>
                                <div>
                                    <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Test Details</h2>
                                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Complete test information</p>
                                </div>
                                <button
                                    onClick={closeTestDetail}
                                    className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl font-bold'
                                >
                                    ×
                                </button>
                            </div>

                            {/* Test Information */}
                            <div className='space-y-5 mb-6'>
                                {/* Test Name */}
                                <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-blue-50 dark:bg-gray-800'>
                                    <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Test Name</p>
                                    <p className='text-lg font-bold text-gray-900 dark:text-white'>{selectedTest.medicalTestData?.name || 'N/A'}</p>
                                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>Category: {selectedTest.medicalTestData?.category || 'N/A'}</p>
                                </div>

                                {/* Test Status */}
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                        <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Status</p>
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${selectedTest.status === 'completed'
                                            ? 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                            : 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                            }`}>
                                            {selectedTest.status ? selectedTest.status.toUpperCase() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                        <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Expected Completion</p>
                                        <p className='text-sm font-medium text-gray-900 dark:text-white'>{selectedTest.etc ? new Date(selectedTest.etc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Testing Staff Information */}
                                {selectedTest.testingStaffData && (
                                    <div className='border border-green-200 dark:border-green-800 rounded-lg p-5 bg-green-50 dark:bg-gray-800'>
                                        <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-4'>Performed By</p>
                                        <div className='flex items-start gap-4'>
                                            <img className='w-16 h-16 rounded-full object-cover border-2 border-green-200 dark:border-green-700' src={selectedTest.testingStaffData.image || 'https://via.placeholder.com/64'} alt={selectedTest.testingStaffData.name} />
                                            <div className='flex-1'>
                                                <p className='font-bold text-gray-900 dark:text-white'>{selectedTest.testingStaffData.name}</p>
                                                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{selectedTest.testingStaffData.qualification}</p>
                                                <div className='grid grid-cols-2 gap-3 mt-3'>
                                                    <div>
                                                        <p className='text-xs font-semibold text-gray-600 dark:text-gray-400'>Department</p>
                                                        <p className='text-sm text-gray-900 dark:text-white font-medium'>{selectedTest.testingStaffData.department}</p>
                                                    </div>
                                                    <div>
                                                        <p className='text-xs font-semibold text-gray-600 dark:text-gray-400'>Experience</p>
                                                        <p className='text-sm text-gray-900 dark:text-white font-medium'>{selectedTest.testingStaffData.experience}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Test Description */}
                                {selectedTest.medicalTestData?.description && (
                                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                        <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Description</p>
                                        <p className='text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.description}</p>
                                    </div>
                                )}

                                {/* Test Details Grid */}
                                <div className='grid grid-cols-2 gap-4'>
                                    {selectedTest.medicalTestData?.preparation && (
                                        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                            <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Preparation</p>
                                            <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.preparation}</p>
                                        </div>
                                    )}
                                    {selectedTest.medicalTestData?.unit && (
                                        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                            <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Unit</p>
                                            <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.unit}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedTest.medicalTestData?.normalRange && (
                                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                        <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-2'>Normal Range</p>
                                        <p className='text-sm text-gray-700 dark:text-gray-300'>{selectedTest.medicalTestData.normalRange}</p>
                                    </div>
                                )}

                                {/* Test Images */}
                                {selectedTest.images && selectedTest.images.length > 0 && (
                                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800'>
                                        <p className='text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 mb-3'>Test Images</p>
                                        <div className='flex gap-3 overflow-x-auto pb-2'>
                                            {selectedTest.images.map((imgUrl, index) => (
                                                <img
                                                    key={index}
                                                    src={imgUrl}
                                                    alt={`Test Image ${index + 1}`}
                                                    className='w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0 hover:shadow-lg transition-shadow'
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className='flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800'>
                                <button
                                    className='px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md'
                                    onClick={closeTestDetail}
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

export default DoctorWaitingTestsResult