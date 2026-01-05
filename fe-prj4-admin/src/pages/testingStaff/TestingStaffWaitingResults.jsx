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
    const [medicalRecordId, setMedicalRecordId] = useState('');
    const [result, setResult] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);

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

    useEffect(() => {
        getWaitingResults();
    }, [tToken]);

    return (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>Test Results Pending</h1>
                <p className='text-gray-600 text-sm'>Add results and notes for medical tests received</p>
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
        </div>
    )
}

export default TestingStaffWaitingResults