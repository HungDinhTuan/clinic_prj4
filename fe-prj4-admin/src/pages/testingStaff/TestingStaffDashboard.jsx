import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext';
import { TestingStaffContext } from '../../context/TestingStaffContext';
import { assets } from '../../assets/assets_admin/assets';
import { NumericFormat } from 'react-number-format';

const TestingStaffDashboard = () => {

  const { tToken, dashData, getTestingStaffDashData } = useContext(TestingStaffContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (tToken) {
      getTestingStaffDashData();
    }
  }, [tToken]);

  return dashData && (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 dark:bg-gray-950 min-h-screen'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2'>Dashboard</h1>
        <p className='text-gray-600 dark:text-gray-400'>Welcome back! Here's your performance overview.</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        {/* Earnings Card */}
        <div className='bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-blue-200 dark:bg-blue-700 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.earning_icon} alt="Earnings" />
            </div>
            <span className='text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full'>Total</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Earnings</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>
            <NumericFormat
              value={dashData.earnings}
              thousandSeparator="."
              decimalSeparator=","
              displayType="text"
              decimalScale={3}
            />&nbsp;VND
          </p>
        </div>

        {/* Completed Tests Card */}
        <div className='bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <div className='bg-green-200 dark:bg-green-700 rounded-lg p-3'>
              <img className='w-6 h-6' src={assets.appointments_icon} alt="Tests" />
            </div>
            <span className='text-xs font-semibold text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full'>Total</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Completed Tests</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{dashData.completedTests}</p>
        </div>
      </div>

      {/* Latest Tests Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 px-6 py-5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
          <div className='bg-blue-100 dark:bg-blue-900/50 rounded-lg p-2'>
            <img className='w-5 h-5' src={assets.list_icon} alt="" />
          </div>
          <div>
            <p className='font-bold text-gray-900 dark:text-white'>All Medical Tests</p>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-0.5'>List of all tests performed</p>
          </div>
        </div>

        {/* Tests List */}
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {dashData.totalTests && dashData.totalTests.length > 0 ? (
            dashData.totalTests.map((test, index) => (
              <div
                className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150'
                key={index}
              >
                {/* Test Info */}
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4'>
                  <div className='flex-1'>
                    <p className='text-gray-900 dark:text-white font-semibold text-sm'>
                      {test.medicalTestData.name}
                    </p>
                    <p className='text-gray-600 dark:text-gray-400 text-xs mt-1'>
                      Category: {test.medicalTestData.category}
                    </p>
                    <p className='text-gray-600 dark:text-gray-400 text-xs mt-1'>
                      Test Date: {slotDateFormat(test.testDoneAt)}
                    </p>
                  </div>

                  {/* Price and Status */}
                  <div className='flex items-center gap-3 sm:ml-4'>
                    <div className='text-right'>
                      <p className='text-gray-600 dark:text-gray-400 text-xs font-medium'>Price</p>
                      <p className='text-lg font-bold text-green-600 dark:text-green-400 mt-1'>
                        <NumericFormat
                          value={test.medicalTestData.price}
                          thousandSeparator="."
                          decimalSeparator=","
                          displayType="text"
                          decimalScale={3}
                        /> VND
                      </p>
                    </div>
                    <div className='flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full'>
                      <span className='text-green-600 dark:text-green-400 text-xs font-semibold capitalize'>
                        {test.status === 'completed' ? '✓ Completed' : test.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Details */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-700 dark:text-gray-300'>Result:</p>
                    <p className='mt-1'>{test.result || 'Pending...'}</p>
                  </div>
                  <div>
                    <p className='font-medium text-gray-700 dark:text-gray-300'>Notes:</p>
                    <p className='mt-1'>{test.notes || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='font-medium text-gray-700 dark:text-gray-300'>Normal Range:</p>
                    <p className='mt-1'>{test.medicalTestData.normalRange}</p>
                  </div>
                  <div>
                    <p className='font-medium text-gray-700 dark:text-gray-300'>Turnaround Time:</p>
                    <p className='mt-1'>{test.medicalTestData.turnaroundTime} days</p>
                  </div>
                </div>

                {/* Images */}
                {test.images && test.images.length > 0 && (
                  <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-700'>
                    <p className='text-xs font-medium text-gray-700 dark:text-gray-300 mb-2'>Test Images:</p>
                    <div className='flex gap-2 flex-wrap'>
                      {test.images.map((image, imgIndex) => (
                        <a
                          key={imgIndex}
                          href={image}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-16 h-16 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200'
                        >
                          <img
                            src={image}
                            alt={`Test ${imgIndex + 1}`}
                            className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
              <p className='text-sm font-medium'>No tests completed yet</p>
              <p className='text-xs'>Tests will appear here as they are performed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestingStaffDashboard