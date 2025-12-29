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
        <div className='w-full max-w-6xl m-5'>
            <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
                <div className='max-sm:hidden grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_2fr_1fr] gap-1 py-3 px-6 border-b'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Doctor</p>
                    <p className='text-center'>Medical Test</p>
                    <p className='text-center'>Fees</p>
                    <p className='text-center'>Symptoms</p>
                    <p className='text-center'>Diagnosis</p>
                    <p className='text-center'>Note</p>
                    <p className='text-center'>ETC</p>
                    <p className='text-center'>Action</p>
                </div>
                {
                    waitingResults.map((item, index) => (
                        <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_2fr_1fr] gap-1 items-center text-gray-500 px-3 py-6 border-b hover:bg-gray-50' key={index}>
                            <p className='max-sm:hidden'>{index + 1}</p>
                            <div className='flex items-center gap-2'>
                                <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <img className='w-8 rounded-full' src={item.doctorData.image} alt="" /> <p>{item.doctorData.name}</p>
                            </div>
                            <p className='max-sm:hidden flex justify-center items-center'>{item.medicalTestInfo.name}</p>
                            <p className='flex justify-center items-center'>
                                <NumericFormat
                                    value={item.medicalTestInfo.price}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    displayType="text"
                                    decimalScale={3}
                                /> VND
                            </p>
                            <p className='flex justify-center items-center'>{item.symptons}</p>
                            <p className='flex justify-center items-center'>{item.diagnosis}</p>
                            <p className='flex justify-center items-center'>{item.notes}</p>
                            <p className='flex justify-center items-center'>{new Date(item.etc).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                            <div className='flex justify-center items-center'>
                                {/* <img className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" /> */}
                                <img onClick={() => { setMedicalRecordId(item.medicalRecordId); setShowPopup(true); }} className='w-10 cursor-pointer' src={assets.details_medical_test_icon} alt="" />
                            </div>
                        </div>
                    ))
                }
            </div>
            {/* popup update results test */}
            {
                showPopup && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg animate-fadeIn'>
                            <p className='text-lg font-semibold text-neutral-800 mb-4'>
                                Test Results
                            </p>
                            <form onSubmit={assignDetailsMedicalTest}>
                                <div className='flex flex-col gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-gray-700'>Result</label>
                                        <textarea
                                            className='border rounded-lg px-2 py-2 text-sm resize-none'
                                            rows='4'
                                            placeholder='Enter test results...'
                                            value={result}
                                            onChange={(e) => setResult(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-gray-700'>Notes</label>
                                        <textarea
                                            className='border rounded-lg px-2 py-2 text-sm resize-none'
                                            rows='4'
                                            placeholder='Enter notes...'
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-gray-700'>Images</label>
                                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary hover:bg-blue-50 transition cursor-pointer'
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
                                                <p className='text-sm font-medium'>Click to upload or drag and drop</p>
                                                <p className='text-xs text-gray-500 mt-1'>PNG, JPG, PDF up to 10MB each</p>
                                                {images.length > 0 && (
                                                    <p className='text-xs text-primary mt-2 font-semibold'>{images.length} file(s) selected</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-end gap-3 mt-6'>
                                    <button
                                        type="button"
                                        onClick={() => setShowPopup(false)}
                                        className='px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 transition cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className='px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition cursor-pointer'
                                    >
                                        Save
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