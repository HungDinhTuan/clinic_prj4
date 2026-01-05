import { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets_admin/assets';

const Medicine = () => {

    const { aToken, backendUrl } = useContext(AdminContext);

    const [name, setName] = useState('');
    const [genericName, setGenericName] = useState('');
    const [category, setCategory] = useState('General physician');
    const [form, setForm] = useState('Pill');
    const [manufacturer, setManufacturer] = useState('');
    const [description, setDescription] = useState('');
    const [indications, setIndications] = useState('');
    const [contraindications, setContraindications] = useState('');
    const [sideEffects, setSideEffects] = useState('');

    const [medicineDetails, setMedicineDetails] = useState(null);

    const [showConfrim, setShowConfirm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const [medicines, setMedicines] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMedicines = async (page = 1) => {
        try {
            const { data } = await axios.get(`${backendUrl}/medicines-paging?page=${page}&limit=8`, {
                headers: { aToken }
            });
            if (data.success) {
                setMedicines(data.medicines);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Something went wrong.");
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const medicineData = {
                name,
                genericName,
                category,
                form,
                manufacturer,
                description,
                indications,
                contraindications,
                sideEffects
            }
            console.log(medicineData);


            const { data } = await axios.post(`${backendUrl}/add-medicine`, medicineData, {
                headers: { aToken }
            });

            if (data.success) {
                toast.success(data.message);
                setName('');
                setGenericName('');
                setCategory('General physician');
                setForm('Pill');
                setManufacturer('');
                setDescription('');
                setIndications('');
                setContraindications('');
                setSideEffects('');
                fetchMedicines();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Something went wrong.");
        }
    }

    const deleteMedicine = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/delete-medicine`, {
                headers: { aToken },
                data: { id }
            });
            if (data.success) {
                toast.success(data.message);
                fetchMedicines();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Something went wrong.");
        }
    }

    const updateMedicine = async (id) => {
        try {
            const updateData = {
                id,
                name: medicineDetails.name,
                genericName: medicineDetails.genericName,
                category: medicineDetails.category,
                form: medicineDetails.form,
                manufacturer: medicineDetails.manufacturer,
                description: medicineDetails.description,
                indications: medicineDetails.indications,
                contraindications: medicineDetails.contraindications,
                sideEffects: medicineDetails.sideEffects
            }

            const { data } = await axios.put(`${backendUrl}/update-medicine`, updateData, { headers: { aToken } });

            if (data.success) {
                toast.success(data.message);
                setIsEdit(false);
                setMedicineDetails(null);
                setShowDetails(false);
                fetchMedicines();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Something went wrong.");
        }
    }

    const findMedicineById = async (id) => {
        try {
            const { data } = await axios.get(`${backendUrl}/medicine/${id}`, {
                headers: { aToken }
            });
            if (data.success) {
                setMedicineDetails(data.medicine);
                setShowDetails(true);
                console.log(data.medicine);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Something went wrong.");
        }
    }

    useEffect(() => {
        if (aToken) {
            fetchMedicines();
        }
    }, [aToken]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchMedicines(newPage);
        }
    };

    return (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-8'>
            {/* Add Medicine Form */}
            <div className='mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-8'>Manage Medicines</h1>

                <form onSubmit={onSubmitHandler} className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                    {/* Form Header */}
                    <div className='bg-gray-50 px-8 py-6 border-b border-gray-200'>
                        <h2 className='text-xl font-bold text-gray-900'>Add New Medicine</h2>
                        <p className='text-gray-600 text-sm mt-1'>Fill in the details to add a new medicine to the system</p>
                    </div>

                    {/* Form Content */}
                    <div className='p-8'>
                        {/* First Row */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Medicine Name</label>
                                <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter medicine name' required />
                            </div>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Generic Name</label>
                                <input onChange={(e) => setGenericName(e.target.value)} value={genericName} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter generic name' required />
                            </div>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Category</label>
                                <select onChange={(e) => setCategory(e.target.value)} value={category} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'>
                                    <option value="General physician">General physician</option>
                                    <option value="Gynecologist">Gynecologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Pediatricians">Pediatricians</option>
                                    <option value="Neurologist">Neurologist</option>
                                    <option value="Gastroenterologist">Gastroenterologist</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Form</label>
                                <select onChange={(e) => setForm(e.target.value)} value={form} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'>
                                    <option value="Pill">Pill</option>
                                    <option value="Liquid">Liquid</option>
                                    <option value="Injection">Injection</option>
                                    <option value="Cream">Cream</option>
                                </select>
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Manufacturer</label>
                                <input onChange={(e) => setManufacturer(e.target.value)} value={manufacturer} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter manufacturer' required />
                            </div>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Indications</label>
                                <input onChange={(e) => setIndications(e.target.value)} value={indications} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter indications' required />
                            </div>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Contraindications</label>
                                <input onChange={(e) => setContraindications(e.target.value)} value={contraindications} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter contraindications' required />
                            </div>
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Side Effects</label>
                                <input onChange={(e) => setSideEffects(e.target.value)} value={sideEffects} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" placeholder='Enter side effects' required />
                            </div>
                        </div>

                        {/* Description */}
                        <div className='mb-6'>
                            <label className='block text-sm font-bold text-gray-800 mb-2'>Description</label>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none' placeholder='Write detailed description about the medicine...' rows={5} required></textarea>
                        </div>

                        {/* Submit Button */}
                        <button type='submit' className='bg-primary px-8 py-3 text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg'>
                            Add Medicine
                        </button>
                    </div>
                </form>
            </div>

            {/* Medicines List */}
            {medicines && (
                <div>
                    {/* Header */}
                    <div className='mb-6'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-2'>All Medicines</h2>
                        <p className='text-gray-600 text-sm'>Manage and view all medicines in the system</p>
                    </div>

                    {/* Table Container */}
                    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                        {/* Table Header */}
                        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] gap-1 py-4 px-6 bg-gray-50 border-b border-gray-200'>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>#</p>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Name</p>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Generic Name</p>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Category</p>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Form</p>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Indications</p>
                            <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Contraindications</p>
                            <p className='text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Actions</p>
                        </div>

                        {/* Table Body */}
                        <div className='max-h-[60vh] overflow-y-auto'>
                            {medicines.length > 0 ? (
                                medicines.map((item, index) => (
                                    <div key={index} className='flex flex-wrap justify-between max-sm:gap-3 max-sm:text-sm sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] items-center px-6 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150'>
                                        <p className='max-sm:hidden font-semibold text-gray-600'>{index + 1}</p>
                                        <p className='font-medium text-gray-900 text-sm'>{item.name}</p>
                                        <p className='text-gray-700 text-sm'>{item.genericName}</p>
                                        <p className='text-gray-700 text-sm'>{item.category}</p>
                                        <p className='text-gray-700 text-sm'>{item.form}</p>
                                        <p className='text-gray-700 text-sm truncate'>{item.indications}</p>
                                        <p className='text-gray-700 text-sm truncate'>{item.contraindications}</p>
                                        <div className='flex justify-center gap-3'>
                                            <button onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} className='p-2 hover:bg-red-100 rounded-lg transition-colors' title='Delete'>
                                                <img src={assets.cancel_icon} alt="Delete" className='w-5 h-5' />
                                            </button>
                                            <button onClick={() => { setSelectedId(item._id); findMedicineById(item._id); }} className='p-2 hover:bg-blue-100 rounded-lg transition-colors' title='View Details'>
                                                <img src={assets.detail_icon} alt="Details" className='w-5 h-5' />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                                    <p className='text-sm font-medium'>No medicines found</p>
                                    <p className='text-xs'>Add a new medicine to get started</p>
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
                                    <h2 className='text-xl font-bold text-gray-900'>Delete Medicine?</h2>
                                    <p className='text-gray-600 text-sm mt-2'>
                                        This action cannot be undone. The medicine will be permanently removed.
                                    </p>
                                </div>

                                <div className='flex gap-3'>
                                    <button className='flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all' onClick={() => setShowConfirm(false)}>
                                        Cancel
                                    </button>
                                    <button className='flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-sm hover:shadow-md' onClick={() => { setShowConfirm(false); deleteMedicine(selectedId); }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Popup */}
                    {showDetails && medicineDetails && (
                        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                            <div className='bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto animate-fadeIn'>
                                <h2 className='text-2xl font-bold text-gray-900 mb-6'>Medicine Details</h2>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'>
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Name</label>
                                        {isEdit ? (
                                            <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicineDetails(prev => ({ ...prev, name: e.target.value }))} value={medicineDetails.name} required />
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Generic Name</label>
                                        {isEdit ? (
                                            <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicineDetails(prev => ({ ...prev, genericName: e.target.value }))} value={medicineDetails.genericName} required />
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.genericName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Category</label>
                                        {isEdit ? (
                                            <select className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' onChange={(e) => setMedicineDetails(prev => ({ ...prev, category: e.target.value }))} value={medicineDetails.category || ''} required>
                                                <option value="General physician">General physician</option>
                                                <option value="Gynecologist">Gynecologist</option>
                                                <option value="Dermatologist">Dermatologist</option>
                                                <option value="Pediatricians">Pediatricians</option>
                                                <option value="Neurologist">Neurologist</option>
                                                <option value="Gastroenterologist">Gastroenterologist</option>
                                            </select>
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Form</label>
                                        {isEdit ? (
                                            <select className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' onChange={(e) => setMedicineDetails(prev => ({ ...prev, form: e.target.value }))} value={medicineDetails.form || ''} required>
                                                <option value="Pill">Pill</option>
                                                <option value="Liquid">Liquid</option>
                                                <option value="Injection">Injection</option>
                                                <option value="Cream">Cream</option>
                                            </select>
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.form}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Manufacturer</label>
                                        {isEdit ? (
                                            <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicineDetails(prev => ({ ...prev, manufacturer: e.target.value }))} value={medicineDetails.manufacturer} required />
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.manufacturer}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Indications</label>
                                        {isEdit ? (
                                            <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicineDetails(prev => ({ ...prev, indications: e.target.value }))} value={medicineDetails.indications} required />
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.indications}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Contraindications</label>
                                        {isEdit ? (
                                            <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicineDetails(prev => ({ ...prev, contraindications: e.target.value }))} value={medicineDetails.contraindications} required />
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.contraindications}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Side Effects</label>
                                        {isEdit ? (
                                            <input className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all' type="text" onChange={(e) => setMedicineDetails(prev => ({ ...prev, sideEffects: e.target.value }))} value={medicineDetails.sideEffects} required />
                                        ) : (
                                            <p className='text-gray-900 font-medium'>{medicineDetails.sideEffects}</p>
                                        )}
                                    </div>
                                </div>

                                <div className='mb-6'>
                                    <label className='block text-sm font-bold text-gray-800 mb-2'>Description</label>
                                    {isEdit ? (
                                        <textarea className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none' rows={4} onChange={(e) => setMedicineDetails(prev => ({ ...prev, description: e.target.value }))} value={medicineDetails.description} required />
                                    ) : (
                                        <p className='text-gray-700 text-sm leading-relaxed'>{medicineDetails.description}</p>
                                    )}
                                </div>

                                <div className='flex gap-3 justify-end'>
                                    {isEdit ? (
                                        <button className='px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md' onClick={() => { updateMedicine(medicineDetails._id); }}>
                                            Save Changes
                                        </button>
                                    ) : (
                                        <button className='px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all' onClick={() => setIsEdit(true)}>
                                            Edit
                                        </button>
                                    )}

                                    <button className='px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all' onClick={() => { setShowDetails(false); setMedicineDetails(null); setIsEdit(false); }}>
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

export default Medicine