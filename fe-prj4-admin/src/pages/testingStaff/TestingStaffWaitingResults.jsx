import React from 'react'
import { useContext } from 'react';
import { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import axios from 'axios';
import { TestingStaffContext } from '../../context/TestingStaffContext.jsx';
import { assets } from '../../assets/assets_admin/assets.js';
import { useState } from 'react';
import { toast } from 'react-toastify';

const TestingStaffWaitingResults = () => {

    const { backendTestingStaffUrl, tToken, waitingResults, getWaitingResults } = useContext(TestingStaffContext);

    const [showPopup, setShowPopup] = useState(false);
    const [showTestDetail, setShowTestDetail] = useState(false);
    const [medicalRecordId, setMedicalRecordId] = useState('');
    const [result, setResult] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    const [testResult, setTestResult] = useState('');
    const [statusFilter, setStatusFilter] = useState('in-progress');

    const assignDetailsMedicalTest = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('medicalRecordId', medicalRecordId);
            formData.append('result', result);
            formData.append('notes', notes);
            images.forEach((image, index) => {
                formData.append('images', image);
            });
            const { data } = await axios.put(`${backendTestingStaffUrl}/assign-test`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    tToken
                },
            });
            if (data.success) {
                getWaitingResults();
                setShowPopup(false);
                toast.success('Details assigned successfully');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error assigning details to medical test');
        }
    };

    const getDetailTestResultById = async (medicalRecordId, testId) => {
        try {
            const { data } = await axios.post(`${backendTestingStaffUrl}/test-result`, { medicalRecordId, testId }, { headers: { tToken } });

            if (data.success) {
                setTestResult(data.testData);
                console.log(data.testData);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.response.data.message || e.message);
        }
    };

    useEffect(() => {
        getWaitingResults(statusFilter);
    }, [tToken, statusFilter]);

    return (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>Test Results Pending</h1>
                <p className='text-gray-600 text-sm'>Add results and notes for medical tests received</p>
            </div>

            {/* Status Filter */}
            <div className='mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg'>
                <div className='space-y-3'>
                    <label className='text-sm font-bold text-gray-800 mb-3 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Test Results Status
                    </label>
                    <div className='flex gap-4 flex-wrap'>
                        <label className='flex items-center gap-3 cursor-pointer group'>
                            <input
                                type='radio'
                                name='statusFilter'
                                value='in-progress'
                                checked={statusFilter === 'in-progress'}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className='w-5 h-5 cursor-pointer accent-blue-600'
                            />
                            <span className='text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors'>In Progress</span>
                        </label>
                        <label className='flex items-center gap-3 cursor-pointer group'>
                            <input
                                type='radio'
                                name='statusFilter'
                                value='completed'
                                checked={statusFilter === 'completed'}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className='w-5 h-5 cursor-pointer accent-green-600'
                            />
                            <span className='text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors'>Completed</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                {/* Table Header */}
                <div className='hidden sm:grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_2fr_1.5fr] gap-1 py-4 px-6 bg-gray-50 border-b border-gray-200'>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>#</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Patient</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Doctor</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Medical Test</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Fees</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Symptoms</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Diagnosis</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Note</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Expected Time</p>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Action</p>
                </div>

                {/* Table Body */}
                <div className='max-h-[60vh] overflow-y-auto'>
                    {
                        waitingResults.length > 0 ? (
                            waitingResults.map((item, index) => (
                                <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-sm sm:grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_2fr_1.5fr] gap-1 items-center px-6 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150' key={index}>
                                    <p className='max-sm:hidden font-semibold text-gray-600'>{index + 1}</p>
                                    <div className='flex items-center gap-3'>
                                        <img className='w-10 h-10 rounded-full ring-2 ring-gray-200' src={item.userData.image} alt="" />
                                        <p className='font-medium text-gray-900'>{item.userData.name}</p>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <img className='w-10 h-10 rounded-full ring-2 ring-gray-200' src={item.doctorData.image} alt="" />
                                        <p className='font-medium text-gray-900'>{item.doctorData.name}</p>
                                    </div>
                                    <p className='max-sm:hidden flex justify-center items-center text-gray-900 font-medium'>{item.medicalTestInfo.name}</p>
                                    <p className='flex justify-center items-center text-gray-900 font-medium'>
                                        <NumericFormat
                                            value={item.medicalTestInfo.price}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            displayType="text"
                                            decimalScale={3}
                                            suffix=" VND"
                                        />
                                    </p>
                                    <p className='flex justify-center items-center text-gray-700 text-sm'>{item.symptons}</p>
                                    <p className='flex justify-center items-center text-gray-700 text-sm'>{item.diagnosis}</p>
                                    <p className='flex justify-center items-center text-gray-700 text-sm truncate'>{item.notes}</p>
                                    <p className='flex justify-center items-center text-gray-700 text-sm'>{new Date(item.etc).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                    <div className='flex justify-center items-center'>
                                                <button
                                                    onClick={() => { setMedicalRecordId(item.medicalRecordId); setShowPopup(true); }}
                                                    className='p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors'
                                                    title='Add results'
                                                >
                                                    <img src={assets.details_medical_test_icon} alt="Add Results" className='w-5 h-5' />
                                                </button>
                                            </div>
                                </div>
                            ))
                        ) : (
                            <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                                <p className='text-sm font-medium'>No test results pending</p>
                                <p className='text-xs'>All tests have results assigned</p>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* Test Results Popup */}
            {
                showPopup && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                        <div className='bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto animate-fadeIn'>
                            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Add Test Results</h2>

                            <form onSubmit={assignDetailsMedicalTest}>
                                <div className='space-y-6'>
                                    {/* Result Textarea */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-3'>Test Result</label>
                                        <textarea
                                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none'
                                            rows='5'
                                            placeholder='Enter detailed test results...'
                                            value={result}
                                            onChange={(e) => setResult(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Notes Textarea */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-3'>Medical Notes</label>
                                        <textarea
                                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none'
                                            rows='4'
                                            placeholder='Add any additional notes...'
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-3'>Upload Result Images/Documents</label>
                                        <div
                                            className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition cursor-pointer'
                                            onClick={() => document.getElementById('file-input').click()}
                                        >
                                            <input
                                                id='file-input'
                                                type='file'
                                                multiple
                                                onChange={(e) => setImages(Array.from(e.target.files))}
                                                required
                                                className='hidden'
                                            />
                                            <div className='text-gray-600'>
                                                <p className='text-sm font-bold text-gray-900'>Click to upload or drag and drop</p>
                                                <p className='text-xs text-gray-500 mt-2'>PNG, JPG, PDF up to 10MB each</p>
                                                {images.length > 0 && (
                                                    <p className='text-xs text-primary mt-3 font-semibold'>
                                                        ✓ {images.length} file{images.length !== 1 ? 's' : ''} selected
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex justify-end gap-3 mt-8'>
                                    <button
                                        type="button"
                                        onClick={() => setShowPopup(false)}
                                        className='px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className='px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md'
                                    >
                                        Save Results
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Test Result Details Popup */}
            {
                showTestDetail && testResult && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                        <div className='bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn border border-gray-200'>
                            {/* Header */}
                            <div className='sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200 flex items-center justify-between'>
                                <div>
                                    <h2 className='text-2xl font-bold text-gray-900 mb-1'>🔬 Test Results Details</h2>
                                    <p className='text-sm text-gray-600'>{testResult.medicalTestData?.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowTestDetail(false)}
                                    className='text-gray-600 hover:text-gray-900 text-3xl font-bold'
                                >
                                    ×
                                </button>
                            </div>

                            {/* Body */}
                            <div className='p-8 space-y-8'>
                                {/* Patient & Doctor Info */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    {/* Patient Card */}
                                    <div className='bg-blue-50 rounded-xl p-6 border border-blue-200'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <img className='w-16 h-16 rounded-full ring-2 ring-blue-300' src={testResult.userData?.image} alt="" />
                                            <div>
                                                <p className='text-xs font-semibold text-blue-600 uppercase tracking-wide'>Patient</p>
                                                <p className='text-lg font-bold text-gray-900'>{testResult.userData?.name}</p>
                                            </div>
                                        </div>
                                        <div className='space-y-2 text-sm'>
                                            <p><span className='font-semibold text-gray-700'>Email:</span> <span className='text-gray-600'>{testResult.userData?.email}</span></p>
                                            <p><span className='font-semibold text-gray-700'>Phone:</span> <span className='text-gray-600'>{testResult.userData?.phone}</span></p>
                                            <p><span className='font-semibold text-gray-700'>Gender:</span> <span className='text-gray-600'>{testResult.userData?.gender}</span></p>
                                        </div>
                                    </div>

                                    {/* Doctor Card */}
                                    <div className='bg-purple-50 rounded-xl p-6 border border-purple-200'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <img className='w-16 h-16 rounded-full ring-2 ring-purple-300' src={testResult.doctorData?.image} alt="" />
                                            <div>
                                                <p className='text-xs font-semibold text-purple-600 uppercase tracking-wide'>Consulting Doctor</p>
                                                <p className='text-lg font-bold text-gray-900'>{testResult.doctorData?.name}</p>
                                            </div>
                                        </div>
                                        <div className='space-y-2 text-sm'>
                                            <p><span className='font-semibold text-gray-700'>Specialty:</span> <span className='text-gray-600'>{testResult.doctorData?.speciality}</span></p>
                                            <p><span className='font-semibold text-gray-700'>Experience:</span> <span className='text-gray-600'>{testResult.doctorData?.experience}</span></p>
                                            <p><span className='font-semibold text-gray-700'>Degree:</span> <span className='text-gray-600'>{testResult.doctorData?.degree}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Info Grid */}
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                                        <p className='text-xs font-semibold text-gray-600 uppercase mb-1'>Status</p>
                                        <div className='flex items-center gap-2'>
                                            <span className='inline-block w-3 h-3 rounded-full bg-green-500'></span>
                                            <span className='font-bold text-gray-900 capitalize'>{testResult.status}</span>
                                        </div>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                                        <p className='text-xs font-semibold text-gray-600 uppercase mb-1'>Price</p>
                                        <p className='font-bold text-blue-600'>
                                            <NumericFormat
                                                value={testResult.medicalTestData?.price}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                displayType="text"
                                                suffix=" VND"
                                            />
                                        </p>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                                        <p className='text-xs font-semibold text-gray-600 uppercase mb-1'>Turnaround Time</p>
                                        <p className='font-bold text-gray-900'>{testResult.medicalTestData?.turnaroundTime} days</p>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                                        <p className='text-xs font-semibold text-gray-600 uppercase mb-1'>Done Date</p>
                                        <p className='font-bold text-gray-900 text-sm'>{new Date(testResult.testDoneAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>

                                {/* Test Description */}
                                <div className='bg-blue-50 rounded-xl p-6 border border-blue-200'>
                                    <p className='text-sm font-bold text-gray-900 mb-3'>📖 Test Description</p>
                                    <p className='text-sm text-gray-700 leading-relaxed'>{testResult.medicalTestData?.description}</p>
                                </div>

                                {/* Preparation & Normal Range */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='bg-orange-50 rounded-xl p-6 border border-orange-200'>
                                        <p className='text-sm font-bold text-gray-900 mb-3'>⚠️ Preparation</p>
                                        <p className='text-sm text-gray-700'>{testResult.medicalTestData?.preparation}</p>
                                    </div>
                                    <div className='bg-green-50 rounded-xl p-6 border border-green-200'>
                                        <p className='text-sm font-bold text-gray-900 mb-3'>✓ Normal Range</p>
                                        <p className='text-sm text-gray-700'>{testResult.medicalTestData?.normalRange}</p>
                                    </div>
                                </div>

                                {/* Test Result */}
                                <div className='bg-yellow-50 rounded-xl p-6 border border-yellow-200'>
                                    <p className='text-sm font-bold text-gray-900 mb-3'>🧪 Test Result</p>
                                    <div className='bg-white rounded-lg p-4 border border-yellow-200 max-h-48 overflow-y-auto'>
                                        <p className='text-sm text-gray-700 whitespace-pre-wrap font-mono'>{testResult.result}</p>
                                    </div>
                                </div>

                                {/* Medical Notes */}
                                {testResult.notes && (
                                    <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
                                        <p className='text-sm font-bold text-gray-900 mb-3'>📝 Medical Notes</p>
                                        <div className='bg-white rounded-lg p-4 border border-gray-200 max-h-32 overflow-y-auto'>
                                            <p className='text-sm text-gray-700'>{testResult.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Result Images */}
                                {testResult.images && testResult.images.length > 0 && (
                                    <div className='border-t border-gray-200 pt-8'>
                                        <p className='text-sm font-bold text-gray-900 mb-6'>🖼️ Result Images/Documents</p>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                                            {testResult.images.map((image, idx) => (
                                                <div key={idx} className='group relative rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
                                                    <img
                                                        src={image}
                                                        alt={`Test result ${idx + 1}`}
                                                        className='w-full h-48 object-cover'
                                                    />
                                                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                                        <a
                                                            href={image}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm'
                                                        >
                                                            View Full
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end'>
                                <button
                                    onClick={() => setShowTestDetail(false)}
                                    className='px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md'
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

export default TestingStaffWaitingResults