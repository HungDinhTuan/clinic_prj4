import { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { NumericFormat } from 'react-number-format';
import { assets } from '../../assets/assets_admin/assets';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, backendDocUrl, medicines, getAllMedicines, medicalTests, getAllMedicalTests } = useContext(DoctorContext);
  // const { medicines, getAllMedicines, medicalTests, getAllMedicalTests} = useContext(AdminContext);
  const { calculateAge, slotDateFormat } = useContext(AppContext);

  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalRecordData, setMedicalRecordData] = useState({
    symptoms: '',
    diagnosis: '',
    orderedTests: [],
    prescribedMedicines: [],
  });
  const [step, setStep] = useState(1);
  const [prescribedMedicines, setPrescribedMedicines] = useState([{ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }]);

  useEffect(() => {
    if (dToken) {
      getAppointments();
      getAllMedicalTests();
      getAllMedicines();
      // console.log(appointments);
      const interval = setInterval(filterAppointments, 30000); // Polling 30s
      return () => clearInterval(interval);
    }
  }, [dToken, appointments]);

  const filterAppointments = async () => {
    try {
      const filtered = [];
      for (const app of appointments) {
        if (app.isCompleted || app.cancelled) continue;
        const record = await axios.get(`${backendDocUrl}/medical-records/appointment/${app._id}`, { headers: { dToken } });
        if (!record.data.record) {
          filtered.push(app); // Chưa có record, hiển thị để tiếp nhận
          continue;
        }
        const hasPendingTests = record.data.record.orderedTests.some(test => test.status === 'pending');
        const hasPrescription = record.data.record.prescribedMedicines.length > 0;
        if (!hasPendingTests && !hasPrescription) {
          filtered.push(app); // Có kết quả test (hoặc no test), chưa kê đơn
        }
      }
      setFilteredAppointments(filtered);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAccept = (appointment) => {
    setSelectedAppointment(appointment);
    setMedicalRecordData({
      symptoms: '',
      diagnosis: '',
      orderedTests: [],
      prescribedMedicines: [],
    });
    setPrescribedMedicines([{ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setShowModal(true);
    setStep(1);
  };

  const handleSubmitBasic = async () => {
    try {
      await axios.post(`${backendDocUrl}/doctor/create-medical-record`, { 
        appointmentId: selectedAppointment._id, 
        symptoms: medicalRecordData.symptoms, 
        diagnosis: medicalRecordData.diagnosis 
      }, { headers: { dToken } });
      setStep(2);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSkipTests = () => {
    setStep(3);
  };

  const handleSubmitTests = async () => {
    try {
      await axios.put(`${backendDocUrl}/doctor/assign-tests/${selectedAppointment._id}`, { testIds: medicalRecordData.orderedTests }, { headers: { dToken } });
      setShowModal(false); // Đóng modal, chờ test complete để hiển thị lại
      getAppointments();
    } catch (e) {
      console.log(e);
    }
  };

  const addMedicine = () => {
    setPrescribedMedicines([...prescribedMedicines, { medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const updateMedicine = (index, field, value) => {
    const newMeds = [...prescribedMedicines];
    newMeds[index][field] = value;
    setPrescribedMedicines(newMeds);
  };

  const handleSubmitPrescription = async () => {
    try {
      await axios.put(`${backendDocUrl}/doctor/prescribe-medicines/${selectedAppointment._id}`, { medicines: prescribedMedicines }, { headers: { dToken } });
      setShowModal(false);
      getAppointments();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>Danh Sách Bệnh Nhân Chờ</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_1.5fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Bệnh nhân</p>
          <p>Thanh toán</p>
          <p>Tuổi</p>
          <p>Ngày & Giờ</p>
          <p>Phí</p>
          <p>Hành động</p>
        </div>
        {filteredAppointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_1.5fr_1fr_1fr] gap-1 items-center text-gray-500 px-3 py-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment ? 'Online' : 'Cash'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>
              <NumericFormat value={item.amount} thousandSeparator="." decimalSeparator="," displayType="text" decimalScale={3} /> VND
            </p>
            <div className='flex'>
              <img className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" onClick={() => {/* Handle cancel */}} />
              <img className='w-10 cursor-pointer' src={assets.tick_icon} alt="" onClick={() => handleAccept(item)} />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-96 shadow-lg animate-fadeIn'>
            <h2 className='text-lg font-semibold text-neutral-800 mb-3'>Quy Trình Khám Bệnh</h2>

            {step === 1 && (
              <>
                <p className='text-sm text-zinc-600 mb-5'>Điền thông tin cơ bản</p>
                <input type="text" placeholder="Triệu chứng" value={medicalRecordData.symptoms} onChange={(e) => setMedicalRecordData({ ...medicalRecordData, symptoms: e.target.value })} className='w-full p-2 border rounded mb-2' required />
                <input type="text" placeholder="Chẩn đoán" value={medicalRecordData.diagnosis} onChange={(e) => setMedicalRecordData({ ...medicalRecordData, diagnosis: e.target.value })} className='w-full p-2 border rounded mb-2' required />
                <div className='flex justify-end gap-3'>
                  <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200' onClick={() => setShowModal(false)}>Hủy</button>
                  <button className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700' onClick={handleSubmitBasic}>Tiếp Tục</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className='text-sm text-zinc-600 mb-5'>Chọn xét nghiệm (nếu cần)</p>
                <select multiple className='w-full p-2 border rounded mb-2' onChange={(e) => setMedicalRecordData({ ...medicalRecordData, orderedTests: Array.from(e.target.selectedOptions, opt => opt.value) })}>
                  {medicalTests.map(test => (
                    <option key={test._id} value={test._id}>{test.name} - <NumericFormat value={test.price} thousandSeparator="." decimalSeparator="," displayType="text" /> VND</option>
                  ))}
                </select>
                <div className='flex justify-end gap-3'>
                  <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200' onClick={handleSkipTests}>Bỏ Qua</button>
                  <button className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700' onClick={handleSubmitTests}>Gửi Xét Nghiệm</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className='text-sm text-zinc-600 mb-5'>Kê đơn thuốc</p>
                {prescribedMedicines.map((med, idx) => (
                  <div key={idx} className='mb-4 border p-2 rounded'>
                    <select className='w-full p-2 border rounded mb-1' value={med.medicineId} onChange={(e) => updateMedicine(idx, 'medicineId', e.target.value)} required>
                      <option value="">Chọn thuốc</option>
                      {medicines.map(medicine => (
                        <option key={medicine._id} value={medicine._id}>{medicine.name}</option>
                      ))}
                    </select>
                    <input type="text" placeholder="Liều lượng" value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} className='w-full p-2 border rounded mb-1' required />
                    <input type="text" placeholder="Tần suất" value={med.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} className='w-full p-2 border rounded mb-1' required />
                    <input type="text" placeholder="Thời gian" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} className='w-full p-2 border rounded mb-1' required />
                    <input type="text" placeholder="Hướng dẫn" value={med.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)} className='w-full p-2 border rounded mb-1' />
                  </div>
                ))}
                <button className='mb-2 text-blue-600 underline' onClick={addMedicine}>+ Thêm Thuốc</button>
                <div className='flex justify-end gap-3'>
                  <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200' onClick={() => setShowModal(false)}>Hủy</button>
                  <button className='px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700' onClick={handleSubmitPrescription}>Hoàn Thành</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;