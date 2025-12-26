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
      const { data } = await axios.get(`${backendUrl}/medical-tests?page=${page}&limit=10`, { headers: { aToken } });
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
    <div >
      <div >
        <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-sm border max-w-6xl'>
          <p className='text-lg font-semibold text-neutral-800 mb-6'>Add Medical Test</p>
          <div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Name</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
              </div>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Preparation</p>
                <input onChange={(e) => setPreparation(e.target.value)} value={preparation} className='border rounded px-3 py-2' type="text" placeholder='Preparation' required />
              </div>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Category</p>
                <select onChange={(e) => setCategory(e.target.value)} value={category} className='border rounded px-3 py-2' name="" id="">
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Immunology">Immunology</option>
                  <option value="Pathology">Pathology</option>
                </select>
              </div>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Unit</p>
                <select onChange={(e) => setUnit(e.target.value)} value={unit} className='border rounded px-3 py-2' name="" id="">
                  <option value="mg/dL">mg/dL</option>
                  <option value="g/L">g/L</option>
                  <option value="mmol/L">mmol/L</option>
                  <option value="IU/L">IU/L</option>
                  <option value="cells/mcL">cells/mcL</option>
                </select>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5'>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Fees</p>
                <NumericFormat thousandSeparator="." decimalSeparator="," decimalScale={3} fixedDecimalScale={false} value={fees} allowNegative={false} onValueChange={(values) => {
                  const rawValue = Number(values.value);
                  if (rawValue > 5_000_000) {
                    toast.warn("Fees have to be less than 5.000.000 VNĐ")
                    return;
                  }
                  setFees(values.value);
                }}
                  className='border rounded px-3 py-2' placeholder='VNĐ' required min="1" id='fees' />
              </div>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Turnaround Time</p>
                <input className='border rounded px-3 py-2' type="number" placeholder='Experience' required min="1" value={turnaroundTime} onChange={handleChangeTurnaroundTime} />
                {/**only display when value > 0 */}
                {
                  turnaroundTime !== "" && turnaroundTime > 0 && (
                    <span className="text-sm text-gray-500 ml-1 mt-1">{displayTurnaroundTime}</span>
                  )
                }
              </div>
              <div className='flex-1 flex flex-col gap-1'>
                <p>Normal Range</p>
                <input onChange={(e) => setNormalRange(e.target.value)} value={normalRange} className='border rounded px-3 py-2' type="text" placeholder='Normal Range' required />
              </div>
            </div>
            <div className='mt-6'>
              <p className='mt-4 mb-2'>About Medical Test</p>
              <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-4 pt-2 border rounded' placeholder='Write about medicine...' rows={5} required></textarea>
            </div>
            <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full cursor-pointer'>Add Medical Test</button>
          </div>
        </form>
      </div>
      {
        medicalTests && (
          <div className='w-full mt-8'>
            <p className='mb-3 text-lg font-medium'>All Medical Tests</p>
            <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
              <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] grid-flow-col py-3 px-6 border-b'>
                <p>#</p>
                <p>Name</p>
                <p>Fees</p>
                <p>Category</p>
                <p>Unit</p>
                <p>Turnaround Time</p>
                <p>Normal Range</p>
                <p>Actions</p>
              </div>
              {
                medicalTests.map((item, index) => (
                  <div key={index} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'>
                    <p>{index + 1}</p>
                    <p className='font-medium'>{item.name}</p>
                    <p><NumericFormat
                      value={item.fees}
                      thousandSeparator="."
                      decimalSeparator=","
                      displayType="text"
                      decimalScale={3} /> VND</p>
                    <p>{item.category}</p>
                    <p>{item.unit}</p>
                    <p className='truncate'>{item.turnaroundTime} h</p>
                    <p className='truncate'>{item.normalRange}</p>
                    <div className='flex items-center gap-4'>
                      <img src={assets.cancel_icon} alt="" className='w-10 cursor-pointer' onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} />
                      <img src={assets.detail_icon} alt="" className='w-10 cursor-pointer' onClick={() => { setSelectedId(item._id); findMedicalTestById(item._id); }} />
                    </div>
                  </div>
                ))
              }
            </div>
            {/* pagination */}
            <div className='flex justify-center border-black items-center mt-4 bg-white py-2 rounded-full text-white'>
              <img src={assets.left_arrow_icon} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className='bg-white border-black rounded-full px-3 py-1 mx-2 disabled:opacity-50 cursor-pointer' alt="" />
              <span className='bg-white border-black rounded-full text-black px-4 py-1'>
                Page {currentPage} / {totalPages}
              </span>
              <img src={assets.right_arrow_icon} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className='bg-white border-black rounded-full px-3 py-1 mx-2 disabled:opacity-50 cursor-pointer' alt="" />
            </div>
            {/*popup confirm cancel*/}
            {showConfrim && (
              <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-xl p-6 w-80 shadow-lg animate-fadeIn'>
                  <h2 className='text-lg font-semibold text-neutral-800 mb-3'>
                    Confirm Cancellation
                  </h2>
                  <p className='text-sm text-zinc-600 mb-5'>
                    Are you sure?
                  </p>
                  <div className='flex justify-end gap-3'>
                    <button className='px-4 py-2 rounded border text-sm text-stone-600 hover:bg-gray-200 transition cursor-pointer' onClick={() => setShowConfirm(false)}>No</button>
                    <button className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer' onClick={() => { setShowConfirm(false); deleteMedicalTest(selectedId); }}>Yes, cancel</button>
                  </div>
                </div>
              </div>
            )}
            {/* popup details */}
            {showDetails && medicalTestDetails && (
              <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                <div className='bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 relative max-h-[85vh] overflow-y-auto animate-fadeIn'>

                  <p className='text-lg font-semibold text-neutral-800 mb-6'>
                    Medical Test Details
                  </p>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>

                    <div>
                      <p className='text-gray-500 mb-1'>Name</p>
                      {isEdit
                        ? <input className='w-full border rounded px-3 py-2'
                          type="text"
                          onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, name: e.target.value }))} value={medicalTestDetails.name} required />
                        : <p className='font-medium'>{medicalTestDetails.name}</p>}
                    </div>

                    <div>
                      <p className='text-gray-500 mb-1'>Fees</p>
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
                              toast.warn("Fees have to be less than 5.000.000 VNĐ");
                              return;
                            }
                            setMedicalTestDetails(prev => ({ ...prev, fees: values.value }));
                          }}
                          className='w-full border rounded px-3 py-2'
                          placeholder='VNĐ'
                          required
                          min="1"
                          id='fees'
                        />
                      ) : (
                        <p className='font-medium'>
                          {medicalTestDetails.fees ? (
                            <NumericFormat
                              value={medicalTestDetails.fees}
                              displayType="text"
                              thousandSeparator="."
                              decimalSeparator=","
                              suffix=" VNĐ"
                            />
                          ) : (
                            '-'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className='text-gray-500 mb-1'>Category</p>
                      {isEdit ? (
                        <div className='flex-1 flex flex-col gap-1'>
                          <select
                            onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, category: e.target.value }))}
                            value={medicalTestDetails.category || ''}
                            className='w-full border rounded px-3 py-2'
                            required
                          >
                            <option value="" disabled>
                              -- Chọn danh mục --
                            </option>
                            <option value="Hematology">Hematology</option>
                            <option value="Biochemistry">Biochemistry</option>
                            <option value="Microbiology">Microbiology</option>
                            <option value="Immunology">Immunology</option>
                            <option value="Pathology">Pathology</option>
                          </select>
                        </div>
                      ) : (
                        <p className='font-medium'>
                          {medicalTestDetails.category || '-'}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className='text-gray-500 mb-1'>Preparation</p>
                      {isEdit
                        ? <input className='w-full border rounded px-3 py-2'
                          type="text"
                          onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, preparation: e.target.value }))} value={medicalTestDetails.preparation} required />
                        : <p className='font-medium'>{medicalTestDetails.preparation}</p>}
                    </div>

                    <div>
                      <p className='text-gray-500 mb-1'>Turnaround Time</p>
                      {isEdit ? (
                        <div className='flex-1 flex flex-col gap-1'>
                          <input
                            className='w-full border rounded px-3 py-2'
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
                          {medicalTestDetails.turnaroundTime !== '' &&
                            medicalTestDetails.turnaroundTime > 0 && (
                              <span className="text-sm text-gray-500 ml-1 mt-1">
                                hour{medicalTestDetails.turnaroundTime > 1 ? 's' : ''}
                              </span>
                            )}
                        </div>
                      ) : (
                        <p className='font-medium'>
                          {medicalTestDetails.turnaroundTime > 0 ? (
                            <>
                              {medicalTestDetails.turnaroundTime} hour{medicalTestDetails.turnaroundTime > 1 ? 's' : ''}
                            </>
                          ) : (
                            '-'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className='text-gray-500 mb-1'>Unit</p>
                      {isEdit ? (
                        <div className='flex-1 flex flex-col gap-1'>
                          <select
                            onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, unit: e.target.value }))}
                            value={medicalTestDetails.unit || ''}
                            className='w-full border rounded px-3 py-2'
                            required
                          >
                            <option value="" disabled>
                              -- Chọn danh mục --
                            </option>
                            <option value="mg/dL">mg/dL</option>
                            <option value="g/L">g/L</option>
                            <option value="mmol/L">mmol/L</option>
                            <option value="IU/L">IU/L</option>
                            <option value="cells/mcL">cells/mcL</option>
                          </select>
                        </div>
                      ) : (
                        <p className='font-medium'>
                          {medicalTestDetails.unit || '-'}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className='text-gray-500 mb-1'>Normal Range</p>
                      {isEdit
                        ? <input className='w-full border rounded px-3 py-2'
                          type="text"
                          onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, normalRange: e.target.value }))} value={medicalTestDetails.normalRange} required />
                        : <p className='font-medium'>{medicalTestDetails.normalRange}</p>}
                    </div>
                  </div>

                  <div className='mt-5'>
                    <p className='text-gray-500 mb-1'>Description</p>
                    {isEdit
                      ? <textarea
                        className='w-full border rounded px-3 py-2'
                        rows={4}
                        onChange={(e) => setMedicalTestDetails(prev => ({ ...prev, description: e.target.value }))} value={medicalTestDetails.description} required />
                      : <p className='text-sm text-gray-700'>
                        {medicalTestDetails.description}
                      </p>}
                  </div>

                  <div className='flex justify-end gap-3 mt-6'>
                    {isEdit ? (
                      <button
                        className='px-5 py-2 rounded bg-primary text-white hover:bg-primary/90 transition'
                        onClick={() => { updateMedicalTest(medicalTestDetails._id); }}>
                        Save
                      </button>
                    ) : (
                      <button
                        className='px-5 py-2 rounded border text-sm text-stone-600 hover:bg-gray-100 transition'
                        onClick={() => setIsEdit(true)}>
                        Edit
                      </button>
                    )}

                    <button
                      className='px-5 py-2 rounded border text-sm text-stone-600 hover:bg-gray-100 transition'
                      onClick={() => { setShowDetails(false); setMedicalTestDetails(null); }}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}

export default MedicalTest