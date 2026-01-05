import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets_admin/assets'
import { AdminContext } from '../../context/AdminContext.jsx'
import axios from 'axios';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';

const AddEmployee = () => {

    const [state, setState] = useState('Doctor');
    const [doctorImage, setDoctorImage] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fees, setFees] = useState('');
    const [degree, setDegree] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [experince, setExperience] = useState('1');
    const [speciality, setSpeciality] = useState('General physician');
    const [about, setAbout] = useState('');
    const [testingStaffImage, setTestingStaffImage] = useState(false);
    const [department, setDepartment] = useState('Hematology');
    const [qualification, setQualification] = useState('');

    const { backendUrl, aToken } = useContext(AdminContext);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            if (state === 'Doctor') {
                if (!doctorImage) {
                    toast.error("Please upload doctor image.");
                    return;
                }
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('fees', fees);
                formData.append('degree', degree);
                formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));
                formData.append('experience', experince + " " + displayYear);
                formData.append('speciality', speciality);
                formData.append('about', about);
                formData.append('image', doctorImage);

                // log formData entries
                formData.forEach((value, key) => {
                    console.log(key, value);
                })

                const { data } = await axios.post(`${backendUrl}/add-doctor`, formData, {
                    headers: { aToken }
                })

                if (data.success) {
                    toast.success(data.message);
                    setDoctorImage(false);
                    setName('');
                    setEmail('');
                    setPassword('');
                    setFees('');
                    setDegree('');
                    setAddress1('');
                    setAddress2('');
                    setExperience('1');
                    setSpeciality('General physician');
                    setAbout('');
                } else {
                    toast.error(data.message);
                }
            } else if (state === 'Testing Staff') {
                if (!testingStaffImage) {
                    toast.error("Please upload testing staff image.");
                    return;
                }
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('department', department);
                formData.append('qualification', qualification);
                formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));
                formData.append('experience', experince + " " + displayYear);
                formData.append('about', about);
                formData.append('image', testingStaffImage);

                formData.forEach((value, key) => {
                    console.log(key, value);
                })

                const { data } = await axios.post(`${backendUrl}/add-testing-staff`, formData, { headers: { aToken } });

                if (data.success) {
                    toast.success(data.message);
                    setTestingStaffImage(false);
                    setName('');
                    setEmail('');
                    setPassword('');
                    setDepartment('');
                    setQualification('')
                    setAddress1('');
                    setAddress2('');
                    setExperience('1');
                    setAbout('');
                } else {
                    toast.error(data.message);
                }
            }
        } catch (err) {
            toast.error(err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Something went wrong.");
            // console.error(err);
        }
    }

    const handleChangeExp = (e) => {
        const value = e.target.value;

        // value null => reset
        if (value === "") {
            setExperience('');
            return;
        }

        const number = Number(value);

        // only value >=0 is valid
        if (number >= 0) {
            setExperience(number);
        }


    };

    const displayYear = experince === ''
        ? ''
        : `year${experince > 1 ? 's' : ''}`;

    return (
        <form onSubmit={onSubmitHandler} className='w-full max-w-6xl mx-auto px-4 sm:px-6 py-8'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>Add {state}</h1>
                <p className='text-gray-600'>Fill in the form below to add a new {state.toLowerCase()}</p>
            </div>

            {/* Form Card */}
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                {/* Image Upload Section */}
                <div className='p-8 border-b border-gray-200 bg-gray-50'>
                    <label htmlFor={state === 'Doctor' ? "doc-img" : "staff-img"} className='flex items-center gap-6 cursor-pointer group'>
                        <div className='relative'>
                            <img
                                className='w-24 h-24 rounded-xl object-cover ring-4 ring-gray-200 group-hover:ring-primary transition-all duration-300'
                                src={state === 'Doctor' ? (doctorImage ? URL.createObjectURL(doctorImage) : assets.upload_area) : (testingStaffImage ? URL.createObjectURL(testingStaffImage) : assets.upload_area)}
                                alt="Profile"
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors duration-300 flex items-center justify-center'>
                                <span className='text-white opacity-0 group-hover:opacity-100 transition-opacity'>Change</span>
                            </div>
                        </div>
                        <div>
                            <p className='text-lg font-semibold text-gray-900'>Upload {state.toLowerCase()} photo</p>
                            <p className='text-sm text-gray-600 mt-1'>Click to upload a profile picture (JPG, PNG)</p>
                        </div>
                    </label>
                    <input onChange={(e) => state === 'Doctor' ? setDoctorImage(e.target.files[0]) : setTestingStaffImage(e.target.files[0])} type="file" id={state === 'Doctor' ? "doc-img" : "staff-img"} hidden />
                </div>

                {/* Form Fields */}
                <div className='p-8'>
                    <div className='flex flex-col lg:flex-row gap-12'>
                        {/* Left Column */}
                        <div className='flex-1 space-y-6'>
                            {/* Employee Type */}
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Employee Type</label>
                                <select
                                    onChange={(e) => setState(e.target.value)}
                                    value={state}
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                >
                                    <option value="Doctor">Doctor</option>
                                    <option value="Testing Staff">Testing Staff</option>
                                </select>
                            </div>

                            {/* Name */}
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>{state} Name</label>
                                <input
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                    type="text"
                                    placeholder='Enter full name'
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>{state} Email</label>
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                    type="email"
                                    placeholder='Enter email address'
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>{state} Password</label>
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                    type="password"
                                    placeholder='Enter secure password'
                                    required
                                />
                            </div>

                            {/* Experience */}
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Experience</label>
                                <input
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                    type="number"
                                    placeholder='Enter experience in years'
                                    required
                                    min="0"
                                    value={experince}
                                    onChange={handleChangeExp}
                                />
                                {experince !== "" && experince > 0 && (
                                    <span className="text-xs font-medium text-primary ml-1 mt-2 block">{displayYear}</span>
                                )}
                            </div>

                            {/* Fees (Doctor only) */}
                            {state === 'Doctor' && (
                                <div>
                                    <label className='block text-sm font-bold text-gray-800 mb-2'>Consultation Fees</label>
                                    <NumericFormat
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={3}
                                        fixedDecimalScale={false}
                                        className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
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
                                        placeholder='Enter fees in VNĐ'
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className='flex-1 space-y-6'>
                            {state === 'Doctor' ? (
                                <>
                                    {/* Speciality */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Speciality</label>
                                        <select
                                            onChange={(e) => setSpeciality(e.target.value)}
                                            value={speciality}
                                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                        >
                                            <option value="General physician">General physician</option>
                                            <option value="Gynecologist">Gynecologist</option>
                                            <option value="Dermatologist">Dermatologist</option>
                                            <option value="Pediatricians">Pediatricians</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Gastroenterologist">Gastroenterologist</option>
                                        </select>
                                    </div>

                                    {/* Education */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Qualification/Degree</label>
                                        <input
                                            onChange={(e) => setDegree(e.target.value)}
                                            value={degree}
                                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                            type="text"
                                            placeholder='e.g. MBBS, MD'
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Department */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Department</label>
                                        <select
                                            onChange={(e) => setDepartment(e.target.value)}
                                            value={department}
                                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                        >
                                            <option value="Hematology">Hematology</option>
                                            <option value="Biochemistry">Biochemistry</option>
                                            <option value="Microbiology">Microbiology</option>
                                            <option value="Parasitology">Parasitology</option>
                                            <option value="Molecular Biology">Molecular Biology</option>
                                            <option value="Diagnostic Imaging">Diagnostic Imaging</option>
                                        </select>
                                    </div>

                                    {/* Qualification */}
                                    <div>
                                        <label className='block text-sm font-bold text-gray-800 mb-2'>Qualification</label>
                                        <input
                                            onChange={(e) => setQualification(e.target.value)}
                                            value={qualification}
                                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                            type="text"
                                            placeholder='e.g. BSc, MSc'
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Address */}
                            <div>
                                <label className='block text-sm font-bold text-gray-800 mb-2'>Address</label>
                                <input
                                    onChange={(e) => setAddress1(e.target.value)}
                                    value={address1}
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all mb-2'
                                    type="text"
                                    placeholder='Street address'
                                    required
                                />
                                <input
                                    onChange={(e) => setAddress2(e.target.value)}
                                    value={address2}
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
                                    type="text"
                                    placeholder='City/District'
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className='mt-8 pt-8 border-t border-gray-200'>
                        <label className='block text-sm font-bold text-gray-800 mb-3'>About {state}</label>
                        <textarea
                            onChange={(e) => setAbout(e.target.value)}
                            value={about}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none'
                            placeholder={`Write a brief bio about the ${state.toLowerCase()}...`}
                            rows={5}
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className='mt-8 flex justify-end'>
                        <button
                            type='submit'
                            className='px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg'
                        >
                            Add {state}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default AddEmployee