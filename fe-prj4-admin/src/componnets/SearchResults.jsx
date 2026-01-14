import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults = [], searchQuery = '' } = location.state || {};
  const [expandedRecord, setExpandedRecord] = useState(null);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleDateString('vi-VN');
  };

  const convertSlotDate = (slotDate) => {
    if (!slotDate) return 'N/A';
    const [day, month, year] = slotDate.split('_');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
          Search Results
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          {searchResults.length > 0
            ? `Found ${searchResults.length} medical record(s) for "${searchQuery}"`
            : `No results found for "${searchQuery}"`
          }
        </p>
      </div>

      {searchResults.length === 0 ? (
        <div className='bg-white dark:bg-gray-800 rounded-lg p-8 text-center'>
          <svg className='w-16 h-16 mx-auto text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <p className='text-gray-600 dark:text-gray-400 text-lg'>No medical records found</p>
          <button
            onClick={() => navigate(-1)}
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className='space-y-4'>
          {searchResults.map((record, index) => (
            <div key={record._id || index} className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition'>
              {/* Header */}
              <div
                onClick={() => setExpandedRecord(expandedRecord === record._id ? null : record._id)}
                className='cursor-pointer p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-3'>
                      {record.userData?.image && (
                        <img
                          src={record.userData.image}
                          alt={record.userData.name}
                          className='w-12 h-12 rounded-full object-cover'
                        />
                      )}
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {record.userData?.name || 'Unknown Patient'}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {record.userData?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Date</p>
                        <p className='font-medium text-gray-900 dark:text-white'>{convertSlotDate(record.slotDate)}</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Time</p>
                        <p className='font-medium text-gray-900 dark:text-white'>{record.slotTime}</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Doctor</p>
                        <p className='font-medium text-gray-900 dark:text-white text-sm'>{record.doctorData?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          {record.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <svg
                    className={`w-5 h-5 text-gray-500 transition transform ${expandedRecord === record._id ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRecord === record._id && (
                <div className='border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30'>
                  {/* Diagnosis Section */}
                  <div className='mb-6'>
                    <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase'>Diagnosis Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>Symptoms</p>
                        <p className='text-gray-900 dark:text-gray-200'>{record.symptons || 'N/A'}</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>Diagnosis</p>
                        <p className='text-gray-900 dark:text-gray-200'>{record.diagnosis || 'N/A'}</p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className='mt-4'>
                        <p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>Notes</p>
                        <p className='text-gray-900 dark:text-gray-200'>{record.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Medical Tests Section */}
                  {record.orderedTests && record.orderedTests.length > 0 && (
                    <div className='mb-6'>
                      <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide'>Medical Tests</h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {record.orderedTests.map((test, idx) => (
                          <div key={idx} className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-blue-300 dark:hover:border-blue-500 transition'>
                            {/* Test Header */}
                            <div className='p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'>
                              <div className='flex justify-between items-start gap-2'>
                                <div className='flex-1'>
                                  <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                                    {test.medicalTestData?.name || 'Test ' + (idx + 1)}
                                  </p>
                                  <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                                    {test.medicalTestData?.category || 'N/A'}
                                  </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${test.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    test.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                  {test.status || 'pending'}
                                </span>
                              </div>
                            </div>

                            {/* Test Images */}
                            {test.images && test.images.length > 0 && (
                              <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-600'>
                                <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide'>Images</p>
                                <div className={`grid gap-2 ${test.images.length === 1 ? 'grid-cols-1' : test.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                  {test.images.map((image, imgIdx) => (
                                    <div key={imgIdx} className='rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square'>
                                      <img
                                        src={image}
                                        alt={`Test ${idx + 1} Image ${imgIdx + 1}`}
                                        className='w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer'
                                        onClick={() => window.open(image, '_blank')}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Test Details */}
                            <div className='p-4 space-y-3'>
                              {test.result && (
                                <div>
                                  <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide'>Result</p>
                                  <p className='text-sm text-gray-900 dark:text-gray-200'>{test.result}</p>
                                </div>
                              )}

                              {test.notes && (
                                <div>
                                  <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide'>Notes</p>
                                  <p className='text-sm text-gray-900 dark:text-gray-200'>{test.notes}</p>
                                </div>
                              )}

                              {test.testDoneAt && (
                                <div className='pt-2 border-t border-gray-200 dark:border-gray-600'>
                                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    Completed: {formatDate(test.testDoneAt)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medicines Section */}
                  {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
                    <div className='mb-6'>
                      <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase'>Prescribed Medicines</h4>
                      <div className='space-y-3'>
                        {record.prescribedMedicines.map((medicine, idx) => (
                          <div key={idx} className='bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <p className='font-medium text-gray-900 dark:text-white'>
                                  {medicine.medicineData?.name || 'Medicine ' + (idx + 1)}
                                </p>
                                <p className='text-xs text-gray-600 dark:text-gray-400'>
                                  {medicine.medicineData?.genericName || ''} - {medicine.medicineData?.form || ''}
                                </p>
                              </div>
                            </div>
                            <div className='grid grid-cols-2 gap-2 mt-2 text-sm'>
                              <div>
                                <span className='text-gray-600 dark:text-gray-400'>Dosage: </span>
                                <span className='text-gray-900 dark:text-gray-200'>{medicine.dosage || 'N/A'}</span>
                              </div>
                              <div>
                                <span className='text-gray-600 dark:text-gray-400'>Frequency: </span>
                                <span className='text-gray-900 dark:text-gray-200'>{medicine.frequency || 'N/A'}</span>
                              </div>
                            </div>
                            {medicine.instructions && (
                              <p className='text-sm text-gray-700 dark:text-gray-300 mt-2'>
                                <span className='text-gray-600 dark:text-gray-400'>Instructions: </span>{medicine.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Section */}
                  {record.followUpdate && (
                    <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800'>
                      <p className='text-sm text-blue-900 dark:text-blue-200'>
                        <span className='font-semibold'>Follow-up Appointment: </span>
                        {formatDate(record.followUpdate)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResults