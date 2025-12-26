import { useContext, useEffect, useState } from 'react';
import { TestingStaffContext } from '../../context/TestingStaffContext';
import { NumericFormat } from 'react-number-format';
import { assets } from '../../assets/assets_admin/assets';
import axios from 'axios';

const TSMedicalTests = () => {
  const { sToken, pendingTests, getPendingTests, updateTestResult } = useContext(TestingStaffContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({ result: '', notes: '', images: [] });

  useEffect(() => {
    if (sToken) {
      getPendingTests();
      const interval = setInterval(getPendingTests, 30000); // Polling 30s
      return () => clearInterval(interval);
    }
  }, [sToken]);

  const handleUpdate = (test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('result', formData.result);
    fd.append('notes', formData.notes);
    formData.images.forEach(file => fd.append('images', file));
    updateTestResult(selectedTest._id, selectedTest.orderedTest._id, fd);
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: [...e.target.files] });
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>Danh Sách Xét Nghiệm Chờ</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        {pendingTests.map((item, index) => (
          <div key={index} className='flex items-center px-3 py-6 border-b hover:bg-gray-50'>
            <p># {index + 1}</p>
            <p className='ml-4'>Bệnh nhân: {item.patient.name}</p>
            <p className='ml-4'>Xét nghiệm: {item.test.name}</p>
            <p className='ml-4'>Giá: <NumericFormat value={item.test.price} thousandSeparator="." decimalSeparator="," displayType="text" /> VND</p>
            <button className='ml-auto bg-blue-600 text-white px-4 py-2 rounded' onClick={() => handleUpdate(item)}>Cập Nhật Kết Quả</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-96 shadow-lg'>
            <h2 className='text-lg font-semibold mb-3'>Cập Nhật Kết Quả Xét Nghiệm</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Kết quả" value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })} className='w-full p-2 border rounded mb-2' required />
              <input type="file" multiple onChange={handleFileChange} className='mb-2' />
              <textarea placeholder="Ghi chú" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className='w-full p-2 border rounded mb-2' />
              <div className='flex justify-end gap-3'>
                <button type="button" className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200' onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className='px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700'>Hoàn Thành</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TSMedicalTests;