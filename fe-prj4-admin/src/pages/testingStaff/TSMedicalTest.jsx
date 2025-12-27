import { useContext, useEffect, useState } from 'react';
import { TestingStaffContext } from '../../context/TestingStaffContext';
import { NumericFormat } from 'react-number-format';
import { assets } from '../../assets/assets_admin/assets';
import axios from 'axios';

const TSMedicalTests = () => {
  const { tToken } = useContext(TestingStaffContext);

  const [showModal, setShowModal] = useState(false);

  return (
    <div className='w-full max-w-6xl m-5'>
      <p>TSMedicalTest</p>
    </div>
  );
};

export default TSMedicalTests;