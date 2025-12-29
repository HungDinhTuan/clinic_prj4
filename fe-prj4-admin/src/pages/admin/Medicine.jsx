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
        <div >
            <div >
                <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-sm border max-w-6xl'>
                    <p className='text-lg font-semibold text-neutral-800 mb-6'>Add Medicine</p>
                    <div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Name</p>
                                <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                            </div>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Generic Name </p>
                                <input onChange={(e) => setGenericName(e.target.value)} value={genericName} className='border rounded px-3 py-2' type="text" placeholder='Generic name' required />
                            </div>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Category</p>
                                <select onChange={(e) => setCategory(e.target.value)} value={category} className='border rounded px-3 py-2' name="" id="">
                                    <option value="General physician">General physician</option>
                                    <option value="Gynecologist">Gynecologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Pediatricians">Pediatricians</option>
                                    <option value="Neurologist">Neurologist</option>
                                    <option value="Gastroenterologist">Gastroenterologist</option>
                                </select>
                            </div>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Form</p>
                                <select onChange={(e) => setForm(e.target.value)} value={form} className='border rounded px-3 py-2' name="" id="">
                                    <option value="Pill">Pill</option>
                                    <option value="Liquid">Liquid</option>
                                    <option value="Injection">Injection</option>
                                    <option value="Cream">Cream</option>
                                </select>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5'>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Manufacturer</p>
                                <input onChange={(e) => setManufacturer(e.target.value)} value={manufacturer} className='border rounded px-3 py-2' type="text" placeholder='Manufacturer' required />
                            </div>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Indications</p>
                                <input onChange={(e) => setIndications(e.target.value)} value={indications} className='border rounded px-3 py-2' type="text" placeholder='Indications' required />
                            </div>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Contraindications</p>
                                <input onChange={(e) => setContraindications(e.target.value)} value={contraindications} className='border rounded px-3 py-2' type="text" placeholder='Contraindications' required />
                            </div>
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Side Effects</p>
                                <input onChange={(e) => setSideEffects(e.target.value)} value={sideEffects} className='border rounded px-3 py-2' type="text" placeholder='Side Effects' required />
                            </div>
                        </div>
                        <div className='mt-6'>
                            <p className='mt-4 mb-2'>About Medicine</p>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-4 pt-2 border rounded' placeholder='Write about medicine...' rows={5} required></textarea>
                        </div>
                        <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full cursor-pointer'>Add Medicine</button>
                    </div>
                </form>
            </div>
            {
                medicines && (
                    <div className='w-full mt-8'>
                        <p className='mb-3 text-lg font-medium'>All Medicines</p>
                        <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
                            <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] grid-flow-col py-3 px-6 border-b'>
                                <p>#</p>
                                <p>Name</p>
                                <p>Generic Name</p>
                                <p>Category</p>
                                <p>Form</p>
                                <p>Indications</p>
                                <p>Contraindications</p>
                                <p>Actions</p>
                            </div>
                            {
                                medicines.map((item, index) => (
                                    <div key={index} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1.5fr_1fr_2fr_2fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'>
                                        <p>{index + 1}</p>
                                        <p className='font-medium'>{item.name}</p>
                                        <p>{item.genericName}</p>
                                        <p>{item.category}</p>
                                        <p>{item.form}</p>
                                        <p className='truncate'>{item.indications}</p>
                                        <p className='truncate'>{item.contraindications}</p>
                                        <div className='flex items-center gap-4'>
                                            <img src={assets.cancel_icon} alt="" className='w-10 cursor-pointer' onClick={() => { setSelectedId(item._id); setShowConfirm(true); }} />
                                            <img src={assets.detail_icon} alt="" className='w-10 cursor-pointer' onClick={() => { setSelectedId(item._id); findMedicineById(item._id); }} />
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
                                        <button className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer' onClick={() => { setShowConfirm(false); deleteMedicine(selectedId); }}>Yes, cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* popup details */}
                        {showDetails && medicineDetails && (
                            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                                <div className='bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 relative max-h-[85vh] overflow-y-auto animate-fadeIn'>

                                    <p className='text-lg font-semibold text-neutral-800 mb-6'>
                                        Medicine Details
                                    </p>

                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Name</p>
                                            {isEdit
                                                ? <input className='w-full border rounded px-3 py-2'
                                                    type="text"
                                                    onChange={(e) => setMedicineDetails(prev => ({ ...prev, name: e.target.value }))} value={medicineDetails.name} required />
                                                : <p className='font-medium'>{medicineDetails.name}</p>}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Generic Name</p>
                                            {isEdit
                                                ? <input className='w-full border rounded px-3 py-2'
                                                    type="text"
                                                    onChange={(e) => setMedicineDetails(prev => ({ ...prev, genericName: e.target.value }))} value={medicineDetails.genericName} required />
                                                : <p className='font-medium'>{medicineDetails.genericName}</p>}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Category</p>
                                            {isEdit ? (
                                                <div className='flex-1 flex flex-col gap-1'>
                                                    <select
                                                        onChange={(e) => setMedicineDetails(prev => ({ ...prev, category: e.target.value }))}
                                                        value={medicineDetails.category || ''}
                                                        className='w-full border rounded px-3 py-2'
                                                        required
                                                    >
                                                        <option value="" disabled>
                                                            -- Chọn danh mục --
                                                        </option>
                                                        <option value="General physician">General physician</option>
                                                        <option value="Gynecologist">Gynecologist</option>
                                                        <option value="Dermatologist">Dermatologist</option>
                                                        <option value="Pediatricians">Pediatricians</option>
                                                        <option value="Neurologist">Neurologist</option>
                                                        <option value="Gastroenterologist">Gastroenterologist</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <p className='font-medium'>
                                                    {medicineDetails.category || '-'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Form</p>
                                            {isEdit ? (
                                                <div className='flex-1 flex flex-col gap-1'>
                                                    <select
                                                        onChange={(e) => setMedicineDetails(prev => ({ ...prev, category: e.target.value }))}
                                                        value={medicineDetails.category || ''}
                                                        className='w-full border rounded px-3 py-2'
                                                        required
                                                    >
                                                        <option value="" disabled>
                                                            -- Chọn danh mục --
                                                        </option>
                                                        <option value="Pill">Pill</option>
                                                        <option value="Liquid">Liquid</option>
                                                        <option value="Injection">Injection</option>
                                                        <option value="Cream">Cream</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <p className='font-medium'>
                                                    {medicineDetails.category || '-'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Manufacturer</p>
                                            {isEdit
                                                ? <input className='w-full border rounded px-3 py-2'
                                                    type="text"
                                                    onChange={(e) => setMedicineDetails(prev => ({ ...prev, manufacturer: e.target.value }))} value={medicineDetails.manufacturer} required />
                                                : <p className='font-medium'>{medicineDetails.manufacturer}</p>}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Indications</p>
                                            {isEdit
                                                ? <input className='w-full border rounded px-3 py-2'
                                                    type="text"
                                                    onChange={(e) => setMedicineDetails(prev => ({ ...prev, indications: e.target.value }))} value={medicineDetails.indications} required />
                                                : <p className='font-medium'>{medicineDetails.indications}</p>}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Contraindications</p>
                                            {isEdit
                                                ? <input className='w-full border rounded px-3 py-2'
                                                    type="text"
                                                    onChange={(e) => setMedicineDetails(prev => ({ ...prev, contraindications: e.target.value }))} value={medicineDetails.contraindications} required />
                                                : <p className='font-medium'>{medicineDetails.contraindications}</p>}
                                        </div>

                                        <div>
                                            <p className='text-gray-500 mb-1'>Side Effects</p>
                                            {isEdit
                                                ? <input className='w-full border rounded px-3 py-2'
                                                    type="text"
                                                    onChange={(e) => setMedicineDetails(prev => ({ ...prev, sideEffects: e.target.value }))} value={medicineDetails.sideEffects} required />
                                                : <p className='font-medium'>{medicineDetails.sideEffects}</p>}
                                        </div>

                                    </div>

                                    <div className='mt-5'>
                                        <p className='text-gray-500 mb-1'>Description</p>
                                        {isEdit
                                            ? <textarea
                                                className='w-full border rounded px-3 py-2'
                                                rows={4}
                                                onChange={(e) => setMedicineDetails(prev => ({ ...prev, description: e.target.value }))} value={medicineDetails.description} required />
                                            : <p className='text-sm text-gray-700'>
                                                {medicineDetails.description}
                                            </p>}
                                    </div>

                                    <div className='flex justify-end gap-3 mt-6'>
                                        {isEdit ? (
                                            <button
                                                className='px-5 py-2 rounded bg-primary text-white hover:bg-primary/90 transition'
                                                onClick={() => { updateMedicine(medicineDetails._id); }}>
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
                                            onClick={() => { setShowDetails(false); setMedicineDetails(null); }}>
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

export default Medicine