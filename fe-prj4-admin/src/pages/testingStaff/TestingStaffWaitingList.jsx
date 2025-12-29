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
    <div className='w-full max-w-6xl m-5'>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Doctor</p>
          <p className='text-center'>Medical Test</p>
          <p className='text-center'>Fees</p>
          <p className='text-center'>Symptoms</p>
          <p className='text-center'>Diagnosis</p>
          <p className='text-center'>Note</p>
          <p className='text-center'>Action</p>
        </div>
        {
          pendingTests.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr_1fr] gap-1 items-center text-gray-500 px-3 py-6 border-b hover:bg-gray-50' key={index}>
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
              <div className='flex justify-center items-center'>
                {/* <img className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" /> */}
                <img onClick={() => receivingMedicalTest(item)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default TSMedicalTests;