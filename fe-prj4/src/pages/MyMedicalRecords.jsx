import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import TabNavigation from '../components/TabNavigation'

const MyMedicalRecords = () => {
  const { backendURL, token } = useContext(AppContext);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTestDetail, setShowTestDetail] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [expandedRecords, setExpandedRecords] = useState({});

  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArr = slotDate.split('_');
    return dateArr[0] + " " + month[Number(dateArr[1]) - 1] + " " + dateArr[2];
  }

  const getMedicalRecords = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendURL}/user/medical-records`, { headers: { token } })

      if (data.success) {
        setMedicalRecords(data.medicalRecords.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response?.data?.message || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  }

  const openTestDetail = (test) => {
    setSelectedTest(test);
    setShowTestDetail(true);
  }

  const closeTestDetail = () => {
    setShowTestDetail(false);
    setSelectedTest(null);
  }

  const toggleRecord = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  useEffect(() => {
    if (token) {
      getMedicalRecords();
    }
  }, [token])

  return (
    <div className='max-w-5xl mx-auto p-4'>
      <TabNavigation />
      <div className='space-y-6 mt-6'>
        {loading ? (
          <div className='text-center py-12'>
            <p className='text-lg text-gray-600'>Loading medical records...</p>
          </div>
        ) : medicalRecords.length > 0 ? (
          medicalRecords.map((record, index) => (
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6' key={index}>
              {/* Header - Doctor & Appointment Info */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200'>
                {expandedRecords[record._id] ? (
                  <div className='flex-1'>
                    <div className='flex flex-col gap-2 flex-1'>
                      <div className={`inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full font-semibold text-sm ${record.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.isCompleted ? '✓ Completed' : '⏳ In Progress'}
                      </div>
                      <p className='text-sm text-gray-600 font-medium'>
                        📅 {slotDateFormat(record.slotDate)} | {record.slotTime}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-700 mb-2'>📋 Summary</p>
                    <div className='space-y-1'>
                      {record.orderedTests && record.orderedTests.length > 0 && (
                        <p className='text-sm text-gray-600'>🔬 Tests: <span className='font-semibold text-gray-900'>{record.orderedTests.length}</span></p>
                      )}
                      {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
                        <p className='text-sm text-gray-600'>💊 Medicines: <span className='font-semibold text-gray-900'>{record.prescribedMedicines.length}</span></p>
                      )}
                    </div>
                  </div>
                )}
                <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                  {
                    expandedRecords[record._id]
                      ? null
                      : (
                        <div className='flex flex-col gap-2 flex-1'>
                          <div className={`inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full font-semibold text-sm ${record.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {record.isCompleted ? '✓ Completed' : '⏳ In Progress'}
                          </div>
                          <p className='text-sm text-gray-600 font-medium'>
                            📅 {slotDateFormat(record.slotDate)} | {record.slotTime}
                          </p>
                        </div>
                      )
                  }
                  <button
                    onClick={() => toggleRecord(record._id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-300 whitespace-nowrap border-2 text-base flex items-center justify-center gap-2 ${expandedRecords[record._id]
                      ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                  >
                    <span>{expandedRecords[record._id] ? '△' : '▽'}</span>
                    <span>{expandedRecords[record._id] ? 'Collapse' : 'Expand'}</span>
                  </button>
                </div>
              </div>

              {/* Ordered Tests - Always Visible */}
              {record.orderedTests && record.orderedTests.length > 0 && (
                <div className='mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200'>
                  <p className='text-sm font-bold text-gray-900 mb-4'>🔬 Ordered Tests</p>
                  <div className='space-y-3'>
                    {record.orderedTests.map((test, idx) => (
                      <div key={idx} className='bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                          <div className='flex-1'>
                            <p className='font-semibold text-gray-900'>{test.medicalTestData?.name || 'N/A'}</p>
                            <p className='text-xs text-gray-500 mt-1'>Status: <span className={`font-semibold ${test.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{test.status}</span></p>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <div className='text-right'>
                              <p className='text-xs text-gray-600'>Price</p>
                              <p className='font-bold text-primary'>
                                <NumericFormat
                                  value={test.medicalTestData?.price || 0}
                                  displayType={'text'}
                                  thousandSeparator={true}
                                  suffix={' VND'}
                                />
                              </p>
                            </div>
                            {test.result && (
                              <div className='text-right'>
                                <p className='text-xs text-gray-600'>Result</p>
                                <p className='font-semibold text-gray-900'>{test.result}</p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openTestDetail(test)}
                            className='px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm'
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescribed Medicines - Always Visible */}
              {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
                <div className='mt-6 bg-green-50 rounded-xl p-5 border border-green-200'>
                  <p className='text-sm font-bold text-gray-900 mb-4'>💊 Prescribed Medicines</p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {record.prescribedMedicines.map((medicine, idx) => (
                      <div key={idx} className='bg-white p-4 rounded-lg border border-green-100 hover:shadow-md transition-shadow'>
                        <div className='flex items-start gap-3'>
                          <div className='text-2xl'>💊</div>
                          <div className='flex-1'>
                            <p className='font-bold text-gray-900'>{medicine.medicineData?.name}</p>
                            <p className='text-xs text-gray-600 mt-1'>{medicine.medicineData?.genericName}</p>

                            <div className='mt-3 space-y-2'>
                              <div className='flex justify-between text-sm'>
                                <span className='font-semibold text-gray-700'>Category:</span>
                                <span className='text-gray-900'>{medicine.medicineData?.category}</span>
                              </div>
                              <div className='flex justify-between text-sm'>
                                <span className='font-semibold text-gray-700'>Form:</span>
                                <span className='text-gray-900'>{medicine.medicineData?.form}</span>
                              </div>
                              <div className='flex justify-between text-sm'>
                                <span className='font-semibold text-gray-700'>Dosage:</span>
                                <span className='text-gray-900 font-medium'>{medicine.dosage}</span>
                              </div>
                            </div>

                            {medicine.instructions && (
                              <div className='mt-3 pt-3 border-t border-gray-100'>
                                <p className='text-xs font-semibold text-gray-700 mb-1'>Instructions:</p>
                                <p className='text-xs text-gray-600'>{medicine.instructions}</p>
                              </div>
                            )}

                            <div className='mt-3 pt-3 border-t border-gray-100'>
                              <p className='text-xs font-semibold text-gray-700 mb-1'>Side Effects:</p>
                              <p className='text-xs text-gray-600'>{medicine.medicineData?.sideEffects}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Content */}
              {expandedRecords[record._id] && (
                <div className='animate-in fade-in-0 slide-in-from-top-2 duration-300'>
                  {/* Clinical Information */}
                  <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    {/* Symptoms */}
                    {record.symptons && (
                      <div className='bg-orange-50 rounded-xl p-5 border border-orange-200'>
                        <p className='text-sm font-bold text-gray-900 mb-3'>🔍 Symptoms</p>
                        <p className='text-sm text-gray-700 leading-relaxed'>{record.symptons}</p>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {record.diagnosis && (
                      <div className='bg-purple-50 rounded-xl p-5 border border-purple-200'>
                        <p className='text-sm font-bold text-gray-900 mb-3'>📋 Diagnosis</p>
                        <p className='text-sm text-gray-700 leading-relaxed'>{record.diagnosis}</p>
                      </div>
                    )}
                  </div>

                  {/* Doctor's Notes */}
                  {record.notes && (
                    <div className='mt-6 bg-yellow-50 rounded-xl p-5 border border-yellow-200'>
                      <p className='text-sm font-bold text-gray-900 mb-3'>📝 Doctor's Notes</p>
                      <p className='text-sm text-gray-700 leading-relaxed'>{record.notes}</p>
                    </div>
                  )}

                  {/* Doctor Information - At the end */}
                  <div className='mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200'>
                    <p className='text-sm font-bold text-gray-900 mb-4'>👨‍⚕️ Doctor Information</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='flex justify-between'>
                        <span className='font-semibold text-gray-700'>Doctor:</span>
                        <span className='text-gray-900 font-medium'>{record.doctorData?.name || 'N/A'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='font-semibold text-gray-700'>Speciality:</span>
                        <span className='text-gray-900 font-medium'>{record.doctorData?.speciality || 'N/A'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='font-semibold text-gray-700'>Experience:</span>
                        <span className='text-gray-900 font-medium'>{record.doctorData?.experience || 'N/A'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='font-semibold text-gray-700'>Degree:</span>
                        <span className='text-gray-900 font-medium'>{record.doctorData?.degree || 'N/A'}</span>
                      </div>
                      <div className='flex justify-between sm:col-span-2'>
                        <span className='font-semibold text-gray-700'>Email:</span>
                        <span className='text-gray-900 font-medium'>{record.doctorData?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='text-center py-16'>
            <p className='text-xl font-semibold text-gray-500'>📋 No medical records yet</p>
            <p className='text-sm text-gray-400 mt-2'>Your medical records will appear here after your appointments</p>
          </div>
        )}
      </div>

      {/* Test Detail Popup */}
      {
        showTestDetail && selectedTest && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              {/* Header */}
              <div className='sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200 flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>🔬 Test Results</p>
                  <p className='text-sm text-gray-600 mt-1'>{selectedTest.medicalTestData?.name}</p>
                </div>
                <button
                  onClick={closeTestDetail}
                  className='text-gray-600 hover:text-gray-900 text-3xl font-bold'
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className='p-6 space-y-6'>
                {/* Basic Info */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-xs text-gray-600 font-semibold'>Status</p>
                    <p className={`text-lg font-bold mt-2 ${selectedTest.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedTest.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                    </p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-xs text-gray-600 font-semibold'>Price</p>
                    <p className='text-lg font-bold text-primary mt-2'>
                      <NumericFormat
                        value={selectedTest.medicalTestData?.price || 0}
                        displayType={'text'}
                        thousandSeparator={true}
                        suffix={' VND'}
                      />
                    </p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-xs text-gray-600 font-semibold'>Result</p>
                    <p className='text-lg font-bold text-gray-900 mt-2'>{selectedTest.result || 'N/A'}</p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-xs text-gray-600 font-semibold'>Turnaround Time</p>
                    <p className='text-lg font-bold text-gray-900 mt-2'>{selectedTest.medicalTestData?.turnaroundTime || 'N/A'} days</p>
                  </div>
                </div>

                {/* Description */}
                {selectedTest.medicalTestData?.description && (
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <p className='text-sm font-bold text-gray-900 mb-2'>📖 Description</p>
                    <p className='text-sm text-gray-700'>{selectedTest.medicalTestData.description}</p>
                  </div>
                )}

                {/* Preparation */}
                {selectedTest.medicalTestData?.preparation && (
                  <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                    <p className='text-sm font-bold text-gray-900 mb-2'>⚠️ Preparation</p>
                    <p className='text-sm text-gray-700'>{selectedTest.medicalTestData.preparation}</p>
                  </div>
                )}

                {/* Normal Range */}
                {selectedTest.medicalTestData?.normalRange && (
                  <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                    <p className='text-sm font-bold text-gray-900 mb-2'>✓ Normal Range</p>
                    <p className='text-sm text-gray-700'>{selectedTest.medicalTestData.normalRange}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedTest.notes && (
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                    <p className='text-sm font-bold text-gray-900 mb-2'>📝 Notes</p>
                    <p className='text-sm text-gray-700'>{selectedTest.notes}</p>
                  </div>
                )}

                {/* Test Images */}
                {selectedTest.images && selectedTest.images.length > 0 && (
                  <div className='border-t border-gray-200 pt-6'>
                    <p className='text-sm font-bold text-gray-900 mb-4'>🖼️ Test Images</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {selectedTest.images.map((image, idx) => (
                        <div key={idx} className='rounded-lg overflow-hidden border border-gray-200 shadow-sm'>
                          <img src={image} alt={`Test result ${idx + 1}`} className='w-full h-64 object-cover' />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end'>
                <button
                  onClick={closeTestDetail}
                  className='px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-all'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default MyMedicalRecords