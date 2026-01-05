import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets_admin/assets.js';
import { NumericFormat } from 'react-number-format';

const MedicalTest = () => {

  const { aToken, backendUrl } = useContext(AdminContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fees, setFees] = useState('');
  const [category, setCategory] = useState('Hematology');
  const [preparation, setPreparation] = useState('');
  const [turnaroundTime, setTurnaroundTime] = useState('');
  const [unit, setUnit] = useState('mg/dL');
  const [normalRange, setNormalRange] = useState('');

  const [medicalTestDetails, setMedicalTestDetails] = useState(null);

  const [showConfrim, setShowConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [medicalTests, setMedicalTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMedicalTestDetails = async (page = 1) => {
    try {
      const { data } = await axios.get(`${backendUrl}/medical-tests-paging?page=${page}&limit=8`, { headers: { aToken } });
      if (data.success) {
        setMedicalTests(data.tests);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response && e.response.data && e.response.data.message
        ? e.response.data.message
        : "Something went wrong.");
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const medicalTestData = {
        name,
        description,
        fees,
        category,
        preparation,
        turnaroundTime,
        unit,
        normalRange
      };

      const { data } = await axios.post(`${backendUrl}/add-medical-test`, medicalTestData, { headers: { aToken } });
      if (data.success) {
        fetchMedicalTestDetails();
        setName('');
        setDescription('');
        setFees('');
        setCategory('Hematology');
        setPreparation('');
        setTurnaroundTime('');
        setUnit('mg/dL');
        setNormalRange('');
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response && e.response.data && e.response.data.message
        ? e.response.data.message
        : "Something went wrong.");
    }
  }

  const deleteMedicalTest = async (id) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/delete-medical-test`, {
        headers: { aToken },
        data: { id }
      });
      if (data.success) {
        toast.success(data.message);
        fetchMedicalTestDetails();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response && e.response.data && e.response.data.message
        ? e.response.data.message
        : "Something went wrong.");
    }
  }

  const updateMedicalTest = async (id) => {
    try {
      const updateData = {
        id,
        name: medicalTestDetails.name,
        description: medicalTestDetails.description,
        fees: medicalTestDetails.fees,
        category: medicalTestDetails.category,
        preparation: medicalTestDetails.preparation,
        turnaroundTime: medicalTestDetails.turnaroundTime,
        unit: medicalTestDetails.unit,
        normalRange: medicalTestDetails.normalRange
      };

      const { data } = await axios.put(`${backendUrl}/update-medical-test`, updateData, { headers: { aToken } });

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        setMedicalTestDetails(null);
        setShowDetails(false);
        fetchMedicalTestDetails();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response && e.response.data && e.response.data.message
        ? e.response.data.message
        : "Something went wrong.");
    }
  }

  const findMedicalTestById = async (id) => {
    try {
      const { data } = await axios.get(`${backendUrl}/medical-test/${id}`, { headers: { aToken } });
      if (data.success) {
        setMedicalTestDetails(data.medicalTest);
        setShowDetails(true);
        console.log(data.medicalTest);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response && e.response.data && e.response.data.message
        ? e.response.data.message
        : "Something went wrong.");
    }
  }

  useEffect(() => {
    if (aToken) {
      fetchMedicalTestDetails();
    }
  }, [aToken]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchMedicalTestDetails(newPage);
    }
  };

  const handleChangeTurnaroundTime = (e) => {
    const value = Number(e.target.value);

    // value null => reset
    if (value === "") {
      setTurnaroundTime('');
      return;
    }

    const number = Number(value);

    // only value >=0 is valid
    if (number >= 0) {
      setTurnaroundTime(number);
    }


  };

  const displayTurnaroundTime = turnaroundTime === ''
    ? ''
    : `hour${turnaroundTime > 1 ? 's' : ''}`;

  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
      {/* Add Medical Test Form */}
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-8'>Manage Medical Tests</h1>

        <form onSubmit={onSubmitHandler} className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
          {/* Form Header */}
          <div className='bg-gray-50 px-8 py-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-gray-900'>Add New Medical Test</h2>
            <p className='text-gray-600 text-sm mt-1'>Fill in the details to add a new medical test to the system</p>
          </div>

          {/* Form Content */}
          <div className='p-8'>
            {/* First Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Test Name</label>
                <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter test name' required />
              </div>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Preparation</label>
                <input onChange={(e) => setPreparation(e.target.value)} value={preparation} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter preparation instructions' required />
              </div>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Category</label>
                <select onChange={(e) => setCategory(e.target.value)} value={category} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'>
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Immunology">Immunology</option>
                  <option value="Pathology">Pathology</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Unit</label>
                <select onChange={(e) => setUnit(e.target.value)} value={unit} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'>
                  <option value="mg/dL">mg/dL</option>
                  <option value="g/L">g/L</option>
                  <option value="mmol/L">mmol/L</option>
                  <option value="IU/L">IU/L</option>
                  <option value="cells/mcL">cells/mcL</option>
                </select>
              </div>
            </div>

            {/* Second Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Test Fees</label>
                <NumericFormat
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={3}
                  fixedDecimalScale={false}
                  value={fees}
                  allowNegative={false}
                  onValueChange={(values) => {
                    const rawValue = Number(values.value);
                    if (rawValue > 5_000_000) {
                      toast.warn("Fees must be less than 5,000,000 VNĐ")
                      return;
                    }
                    setFees(values.value);
                  }}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                  placeholder='Enter fees in VNĐ'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Turnaround Time (hours)</label>
                <input
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                  type="number"
                  placeholder='Enter turnaround time'
                  required
                  min="0"
                  value={turnaroundTime}
                  onChange={handleChangeTurnaroundTime}
                />
                {turnaroundTime !== "" && turnaroundTime > 0 && (
                  <span className="text-xs font-medium text-primary ml-1 mt-2 block">{displayTurnaroundTime}</span>
                )}
              </div>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>Normal Range</label>
                <input onChange={(e) => setNormalRange(e.target.value)} value={normalRange} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter normal range' required />
              </div>
            </div>

            {/* Description */}
            <div className='mb-6'>
              <label className='block text-sm font-bold text-gray-800 mb-2'>Description</label>
              <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none' placeholder='Write detailed description about the medical test...' rows={5} required></textarea>
            </div>

            {/* Submit Button */}
            <button type='submit' className='bg-primary px-8 py-3 text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg'>
              Add Medical Test
            </button>
          </div>
        </form>
      </div>

      {/* Medical Tests List */}
      {medicalTests && (
        <div>
          {/* Header */}
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>All Medical Tests</h2>
            <p className='text-gray-600 text-sm'>Manage and view all medical tests in the system</p>
          </div>

          {/* Table Container */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
            {/* Table Header */}
            <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] gap-1 py-4 px-6 bg-gray-50 border-b border-gray-200'>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>#</p>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Name</p>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Fees</p>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Category</p>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Unit</p>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Turnaround Time</p>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Normal Range</p>
              <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Actions</p>
            </div>

            {/* Table Body */}
            <div className='max-h-[60vh] overflow-y-auto'>
              {medicalTests.length > 0 ? (
                medicalTests.map((item, index) => (
                  <div key={index} className='flex flex-wrap justify-between max-sm:gap-3 max-sm:text-sm sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] items-center px-6 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150'>
                    <p className='max-sm:hidden font-semibold text-gray-600'>{index + 1}</p>
                    <p className='font-medium text-gray-900 text-sm'>{item.name}</p>
                    <p className='text-gray-700 text-sm'>
                      <NumericFormat
                        value={item.price}
                        thousandSeparator="."
                        decimalSeparator=","
                        displayType="text"
                        decimalScale={3}
                        suffix=" VND"
                      />
                    </p>
                    <p className='text-gray-700 text-sm'>{item.category}</p>
                    <p className='text-gray-700 text-sm'>{item.unit}</p>
                    <p className='text-gray-700 text-sm'>{item.turnaroundTime} h</p>
                    <p className='text-gray-700 text-sm truncate'>{item.normalRange}</p>
                    <div className='flex justify-center gap-3'>
                      <button onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} className='p-2 hover:bg-red-100 rounded-lg transition-colors' title='Delete'>
                        <img src={assets.cancel_icon} alt="Delete" className='w-5 h-5' />
                      </button>
                      <button onClick={() => { setSelectedId(item._id); findMedicalTestById(item._id); }} className='p-2 hover:bg-blue-100 rounded-lg transition-colors' title='View Details'>
                        <img src={assets.detail_icon} alt="Details" className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                  <p className='text-sm font-medium'>No medical tests found</p>
                  <p className='text-xs'>Add a new medical test to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className='flex justify-center items-center gap-4 mt-6'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              <img src={assets.left_arrow_icon} className='w-5 h-5' alt="Previous" />
            </button>
            <span className='px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-gray-900'>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              <img src={assets.right_arrow_icon} className='w-5 h-5' alt="Next" />
            </button>
          </div>

          {/* Delete Confirmation Popup */}
          {showConfrim && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
              <div className='bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-fadeIn'>
                <div className='mb-6'>
                  <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                    <span className='text-xl'>⚠️</span>
                  </div>
                  <h2 className='text-xl font-bold text-gray-900'>Delete Medical Test?</h2>
                  <p className='text-gray-600 text-sm mt-2'>
                    This action cannot be undone. The medical test will be permanently removed.
                  </p>
                </div>

                <div className='flex gap-3'>
                  <button className='flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all' onClick={() => setShowConfirm(false)}>
                    Cancel
                  </button>
                  <button className='flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-sm hover:shadow-md' onClick={() => { setShowConfirm(false); deleteMedicalTest(selectedId); }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Details Popup */}
          {showDetails && medicalTestDetails && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
              <div className='bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto animate-fadeIn'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6'>Medical Test Details</h2>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'>
                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Test Name</label>
                    {isEdit ? (
                      <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, name: e.target.value }))} value={medicalTestDetails.name} required />
                    ) : (
                      <p className='text-gray-900 font-medium'>{medicalTestDetails.name}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Fees</label>
                    {isEdit ? (
                      <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={3}
                        fixedDecimalScale={false}
                        value={medicalTestDetails.fees}
                        allowNegative={false}
                        onValueChange={(values) => {
                          const rawValue = Number(values.value);
                          if (rawValue > 5_000_000) {
                            toast.warn("Fees must be less than 5,000,000 VNĐ");
                            return;
                          }
                          setMedicalTestDetails(prev => ({ ...prev, fees: values.value }));
                        }}
                        className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                        placeholder='Enter fees in VNĐ'
                        required
                      />
                    ) : (
                      <p className='text-gray-900 font-medium'>
                        <NumericFormat
                          value={medicalTestDetails.fees}
                          displayType="text"
                          thousandSeparator="."
                          decimalSeparator=","
                          suffix=" VNĐ"
                        />
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Category</label>
                    {isEdit ? (
                      <select className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, category: e.target.value }))} value={medicalTestDetails.category || ''} required>
                        <option value="Hematology">Hematology</option>
                        <option value="Biochemistry">Biochemistry</option>
                        <option value="Microbiology">Microbiology</option>
                        <option value="Immunology">Immunology</option>
                        <option value="Pathology">Pathology</option>
                      </select>
                    ) : (
                      <p className='text-gray-900 font-medium'>{medicalTestDetails.category}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Preparation</label>
                    {isEdit ? (
                      <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, preparation: e.target.value }))} value={medicalTestDetails.preparation} required />
                    ) : (
                      <p className='text-gray-900 font-medium'>{medicalTestDetails.preparation}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Turnaround Time (hours)</label>
                    {isEdit ? (
                      <div>
                        <input
                          className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                          type="number"
                          placeholder='Turnaround Time'
                          required
                          min="0"
                          value={medicalTestDetails.turnaroundTime ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setMedicalTestDetails(prev => ({ ...prev, turnaroundTime: '' }));
                              return;
                            }
                            const number = Number(value);
                            if (number >= 0 && Number.isInteger(number)) {
                              setMedicalTestDetails(prev => ({ ...prev, turnaroundTime: number }));
                            }
                          }}
                        />
                        {medicalTestDetails.turnaroundTime !== '' && medicalTestDetails.turnaroundTime > 0 && (
                          <span className="text-xs font-medium text-primary ml-1 mt-2 block">
                            hour{medicalTestDetails.turnaroundTime > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className='text-gray-900 font-medium'>
                        {medicalTestDetails.turnaroundTime > 0 ? (
                          <>{medicalTestDetails.turnaroundTime} hour{medicalTestDetails.turnaroundTime > 1 ? 's' : ''}</>
                        ) : (
                          '-'
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Unit</label>
                    {isEdit ? (
                      <select className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, unit: e.target.value }))} value={medicalTestDetails.unit || ''} required>
                        <option value="mg/dL">mg/dL</option>
                        <option value="g/L">g/L</option>
                        <option value="mmol/L">mmol/L</option>
                        <option value="IU/L">IU/L</option>
                        <option value="cells/mcL">cells/mcL</option>
                      </select>
                    ) : (
                      <p className='text-gray-900 font-medium'>{medicalTestDetails.unit}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>Normal Range</label>
                    {isEdit ? (
                      <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, normalRange: e.target.value }))} value={medicalTestDetails.normalRange} required />
                    ) : (
                      <p className='text-gray-900 font-medium'>{medicalTestDetails.normalRange}</p>
                    )}
                  </div>
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-bold text-gray-800 mb-2'>Description</label>
                  {isEdit ? (
                    <textarea className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none' rows={4} onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, description: e.target.value }))} value={medicalTestDetails.description} required />
                  ) : (
                    <p className='text-gray-700 text-sm leading-relaxed'>{medicalTestDetails.description}</p>
                  )}
                </div>

                <div className='flex gap-3 justify-end'>
                  {isEdit ? (
                    <button className='px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md' onClick={() => { updateMedicalTest(medicalTestDetails._id); }}>
                      Save Changes
                    </button>
                  ) : (
                    <button className='px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all' onClick={() => setIsEdit(true)}>
                      Edit
                    </button>
                  )}

                  <button className='px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all' onClick={() => { setShowDetails(false); setMedicalTestDetails(null); setIsEdit(false); }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MedicalTest