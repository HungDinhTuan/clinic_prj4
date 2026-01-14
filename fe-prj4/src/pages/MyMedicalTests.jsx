import React from 'react'
import TabNavigation from '../components/TabNavigation'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const MyMedicalTests = () => {

    const { backendURL, token } = useContext(AppContext);

    const [testWaitingList, setTestWaitingList] = useState([]);

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

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return '✓';
            case 'in-progress':
                return '⏳';
            case 'pending':
                return '⏱️';
            default:
                return '•';
        }
    }

    const getTestWaitingList = async () => {
        try {
            const { data } = await axios.get(`${backendURL}/user/test-waiting-list`, { headers: { token } });
            if (data?.success) {
                setTestWaitingList(data.testWaitingList);
                console.log(data.testWaitingList);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response.data.message);
        }
    }

    useEffect(() => {
        getTestWaitingList();
    }, [token]);

    return (
        <div className='max-w-6xl mx-auto px-4 py-2'>
            <TabNavigation />
            <div className='space-y-6 mt-6'>
                {
                    testWaitingList.length > 0 ? (
                        testWaitingList.map((item, index) => (
                            <div className='bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden' key={index}>
                                <div className='flex flex-col gap-6 p-6'>
                                    {/* Ordered Tests Section */}
                                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
                                        <h3 className='text-xl font-bold text-neutral-900 mb-5'>🔬 Ordered Tests</h3>
                                        <div className='space-y-5'>
                                            {
                                                item.orderedTests && item.orderedTests.length > 0 ? (
                                                    item.orderedTests.map((test, testIndex) => (
                                                        <div key={testIndex} className='bg-white rounded-xl border border-gray-300 p-5 shadow-sm hover:shadow-md transition-all'>
                                                            {/* Test Header */}
                                                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5 border-b border-gray-200'>
                                                                <div className='flex-1'>
                                                                    <h4 className='text-lg font-bold text-neutral-900'>
                                                                        💉 {test.medicalTestData.name}
                                                                    </h4>
                                                                    <p className='text-xs text-gray-600 mt-2'>
                                                                        Category: <span className='font-semibold text-gray-800'>{test.medicalTestData.category}</span>
                                                                    </p>
                                                                </div>
                                                                <div className={`px-5 py-2.5 rounded-lg font-semibold text-sm inline-block sm:inline-flex gap-2 items-center justify-center whitespace-nowrap ${getStatusBadgeColor(test.status)}`}>
                                                                    <span>{getStatusIcon(test.status)}</span>
                                                                    <span className='capitalize'>{test.status}</span>
                                                                </div>
                                                            </div>

                                                            {/* Performed By Section */}
                                                            {
                                                                test.testingStaffData && (
                                                                    <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300 p-5 mb-5'>
                                                                        <p className='text-sm font-bold text-gray-900 mb-4'>
                                                                            👨‍🔬 Performed By
                                                                        </p>
                                                                        <div className='flex flex-col sm:flex-row gap-4'>
                                                                            <div className='flex items-center gap-3 sm:gap-4 flex-1'>
                                                                                <img className='w-14 h-14 rounded-full object-cover border-2 border-white shadow-md' src={test.testingStaffData.image} alt={test.testingStaffData.name} />
                                                                                <div>
                                                                                    <p className='font-bold text-gray-900 text-sm'>{test.testingStaffData.name}</p>
                                                                                    <p className='text-xs text-gray-600 mt-0.5'>{test.testingStaffData.qualification}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className='text-sm text-gray-700 sm:text-right'>
                                                                                <p className='font-semibold text-gray-900'>{test.testingStaffData.department}</p>
                                                                                <p className='text-xs text-gray-600 mt-1'>{test.testingStaffData.experience}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }

                                                            {/* Test Details Grid */}
                                                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5'>
                                                                <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
                                                                    <p className='text-xs font-bold text-gray-700 mb-2'>💰 Price</p>
                                                                    <p className='text-base font-bold text-primary'>
                                                                        {test.medicalTestData.price.toLocaleString()} VND
                                                                    </p>
                                                                </div>
                                                                <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
                                                                    <p className='text-xs font-bold text-gray-700 mb-2'>⏱️ Turnaround</p>
                                                                    <p className='text-base font-bold text-primary'>
                                                                        {test.medicalTestData.turnaroundTime} days
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Test Description */}
                                                            <div className='bg-white rounded-lg p-4 border border-gray-200 mb-5'>
                                                                <p className='text-xs font-bold text-gray-700 mb-2'>📋 Description</p>
                                                                <p className='text-sm text-gray-700 leading-relaxed'>{test.medicalTestData.description}</p>
                                                            </div>

                                                            {/* Test Preparation & Range */}
                                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5'>
                                                                <div className='bg-white rounded-lg p-4 border border-gray-200'>
                                                                    <p className='text-xs font-bold text-gray-700 mb-2.5'>🔍 Preparation</p>
                                                                    <p className='text-sm text-gray-700 leading-relaxed'>{test.medicalTestData.preparation}</p>
                                                                </div>
                                                                <div className='bg-white rounded-lg p-4 border border-gray-200'>
                                                                    <p className='text-xs font-bold text-gray-700 mb-2.5'>📊 Normal Range</p>
                                                                    <p className='text-sm text-gray-700 leading-relaxed'>{test.medicalTestData.normalRange}</p>
                                                                </div>
                                                            </div>

                                                            {/* Test Images */}
                                                            {
                                                                test.images && test.images.length > 0 && (
                                                                    <div className='mb-5'>
                                                                        <p className='text-xs font-bold text-gray-900 mb-3'>📸 Test Images</p>
                                                                        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                                                                            {
                                                                                test.images.map((image, imgIndex) => (
                                                                                    <div key={imgIndex} className='rounded-lg overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow'>
                                                                                        <img className='w-full h-24 object-cover' src={image} alt={`Test ${imgIndex + 1}`} />
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }

                                                            {/* ETC (Expected Time of Completion) */}
                                                            {
                                                                test.etc && (
                                                                    <div className='bg-orange-50 rounded-lg p-4 border border-orange-200'>
                                                                        <p className='text-xs font-bold text-gray-700 mb-2'>📅 Expected Completion</p>
                                                                        <p className='text-sm text-gray-900 font-semibold'>
                                                                            {new Date(test.etc).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='text-center py-8 bg-white rounded-lg border border-dashed border-gray-300'>
                                                        <p className='text-gray-500 font-medium'>No tests ordered yet</p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Overall Status */}
                                    <div className='flex flex-col sm:flex-row gap-4 pt-6 border-t'>
                                        <div className='flex-1 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200'>
                                            <p className='text-xs font-bold text-gray-700 mb-2'>📋 Overall Status</p>
                                            <p className='text-lg font-bold text-neutral-900'>
                                                {item.isCompleted ? '✓ Completed' : '⏳ In Progress'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='border-t bg-gray-50 p-6'>
                                    {/* Doctor Info Section */}
                                    <div className='flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-6'>
                                        <div className='flex-shrink-0'>
                                            <img className='w-24 h-24 rounded-xl bg-white object-cover shadow-md border border-gray-200' src={item.doctorData.image} alt={item.doctorData.name} />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-2xl font-bold text-neutral-900'>👨‍⚕️ {item.doctorData.name}</p>
                                            <p className='text-sm text-gray-600 mt-2'>{item.doctorData.speciality}</p>
                                            <p className='text-sm text-gray-700 font-semibold mt-3'>
                                                📅 <span className='text-neutral-800'>{slotDateFormat(item.slotDate)} | {item.slotTime}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Medical Info Section */}
                                    <div className='bg-purple-50 rounded-xl p-5 border border-purple-200'>
                                        <p className='text-sm font-bold text-gray-900 mb-4'>
                                            🏥 Medical Information
                                        </p>
                                        <div className='space-y-4'>
                                            <div>
                                                <span className='font-semibold text-gray-700 text-xs block mb-1.5'>Symptoms</span>
                                                <p className='text-gray-900 text-sm bg-white rounded-lg p-2.5 border border-purple-100'>{item.symptons || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className='font-semibold text-gray-700 text-xs block mb-1.5'>Diagnosis</span>
                                                <p className='text-gray-900 text-sm bg-white rounded-lg p-2.5 border border-purple-100'>{item.diagnosis || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className='font-semibold text-gray-700 text-xs block mb-1.5'>Notes</span>
                                                <p className='text-gray-900 text-sm bg-white rounded-lg p-2.5 border border-purple-100'>{item.notes || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-16 bg-white rounded-xl border border-gray-200'>
                            <p className='text-2xl text-gray-400 font-semibold'>📋 No medical tests yet</p>
                            <p className='text-sm text-gray-400 mt-2'>Your medical tests will appear here once scheduled</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default MyMedicalTests