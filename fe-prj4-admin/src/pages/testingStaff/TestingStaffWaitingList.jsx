import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestingStaffContext } from '../../context/TestingStaffContext';
import { assets } from '../../assets/assets_admin/assets';
import { NumericFormat } from 'react-number-format';
import axios from 'axios';

const TSMedicalTests = () => {

  const navigate = useNavigate();

  const { tToken, pendingTests, getPendingTests, backendTestingStaffUrl } = useContext(TestingStaffContext);

  const receivingMedicalTest = async (pendingTest) => {
    try {
      const { data } = await axios.put(`${backendTestingStaffUrl}/received-tests`, {
        pendingTest
      }, { headers: { tToken } });
      if (data.success) {
        getPendingTests();
        navigate('/testing-staff/waiting-results');
      } else {
        console.error(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    getPendingTests();
  }, [tToken]);

  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>Pending Medical Tests</h1>
        <p className='text-gray-600 text-sm'>Review and accept incoming medical test requests</p>
      </div>

      {/* Table Card */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        {/* Table Header */}
        <div className='hidden sm:grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_1.5fr] gap-1 py-4 px-6 bg-gray-50 border-b border-gray-200'>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>#</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Patient</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Doctor</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Medical Test</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Fees</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Symptoms</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Diagnosis</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Note</p>
          <p className='text-xs font-bold text-gray-700 uppercase tracking-wider text-center'>Action</p>
        </div>

        {/* Table Body */}
        <div className='max-h-[60vh] overflow-y-auto'>
          {
            pendingTests.length > 0 ? (
              pendingTests.map((item, index) => (
                <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-sm sm:grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_1.5fr] gap-1 items-center px-6 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150' key={index}>
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
                  <div className='flex justify-center items-center'>
                    <button
                      onClick={() => receivingMedicalTest(item)}
                      className='p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors'
                      title='Accept test'
                    >
                      <img src={assets.tick_icon} alt="Accept" className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <p className='text-sm font-medium'>No pending medical tests</p>
                <p className='text-xs'>All tests have been received</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default TSMedicalTests;