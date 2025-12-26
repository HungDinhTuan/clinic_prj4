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
        <form onSubmit={onSubmitHandler} action="" className='m-5 w-full h-150'>
            <p className='mb-3 text-2xl font-medium'>Add {state}</p>
            {
                state === 'Doctor'
                    ? <p className='text-left mt-2 mb-1 text-sm text-gray-500'>
                        Add Testing Staff?
                        <span
                            className='cursor-pointer text-primary font-medium hover:underline transition'
                            onClick={() => setState('Testing Staff')}
                        >
                            Click here.
                        </span>
                    </p>
                    : <p className='text-left mt-2 mb-1 text-sm text-gray-500'>
                        Add Doctor?
                        <span
                            className='cursor-pointer text-primary font-medium hover:underline transition'
                            onClick={() => setState('Doctor')}
                        >
                            Click here.
                        </span>
                    </p>
            }
            <div className='bg-white px-8 py-8 border rounded w-6xl max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor={state === 'Doctor' ? "doc-img" : "staff-img"}>
                        <img className='cursor-pointer w-16 bg-gray-100 rounded-full' src={state === 'Doctor' ? (doctorImage ? URL.createObjectURL(doctorImage) : assets.upload_area) : (testingStaffImage ? URL.createObjectURL(testingStaffImage) : assets.upload_area)} alt="" />
                    </label>
                    <input onChange={(e) => state === 'Doctor' ? setDoctorImage(e.target.files[0]) : setTestingStaffImage(e.target.files[0])} type="file" id={state === 'Doctor' ? "doc-img" : "staff-img"} hidden />
                    <p>Upload {state.toLowerCase()} <br /> picture</p>
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>{state} name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>{state} email</p>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>{state} password</p>
                            <input onChange={(e) => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='Password' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience</p>
                            <input className='border rounded px-3 py-2' type="number" placeholder='Experience' required min="1" value={experince} onChange={handleChangeExp} />
                            {/**only display when value > 0 */}
                            {
                                experince !== "" && experince > 0 && (
                                    <span className="text-sm text-gray-500 ml-1 mt-1">{displayYear}</span>
                                )
                            }
                        </div>
                        {state === 'Doctor' && (
                            <div className='flex-1 flex flex-col gap-1'>
                                <p>Fees</p>
                                <NumericFormat thousandSeparator="." decimalSeparator="," decimalScale={3} fixedDecimalScale={false} className='border rounded px-3 py-2' value={fees} allowNegative={false} onValueChange={(values) => {
                                    const rawValue = Number(values.value);
                                    if (rawValue > 5_000_000) {
                                        toast.warn("Fees have to be less than 5.000.000 VNĐ")
                                        return;
                                    }
                                    setFees(values.value);
                                }}
                                    placeholder='VNĐ' required min="1" id='fees' />
                            </div>
                        )}
                    </div>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        {state === 'Doctor' ? (
                            <>
                                <div className='flex-1 flex flex-col gap-1'>
                                    <p>Speciality</p>
                                    <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='border rounded px-3 py-2' name="" id="">
                                        <option value="General physician">General physician</option>
                                        <option value="Gynecologist">Gynecologist</option>
                                        <option value="Dermatologist">Dermatologist</option>
                                        <option value="Pediatricians">Pediatricians</option>
                                        <option value="Neurologist">Neurologist</option>
                                        <option value="Gastroenterologist">Gastroenterologist</option>
                                    </select>
                                </div>
                                <div className='flex-1 flex flex-col gap-1'>
                                    <p>Education</p>
                                    <input onChange={(e) => setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='Education' required />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='flex-1 flex flex-col gap-1'>
                                    <p>Department</p>
                                    <select onChange={(e) => setDepartment(e.target.value)} value={department} className='border rounded px-3 py-2' name="" id="">
                                        <option value="Hematology">Hematology</option>
                                        <option value="Biochemistry">Biochemistry</option>
                                        <option value="Microbiology">Microbiology</option>
                                        <option value="Parasitology">Parasitology</option>
                                        <option value="Molecular Biology">Molecular Biology</option>
                                        <option value="Diagnostic Imaging">Diagnostic Imaging</option>
                                    </select>
                                </div>
                                <div className='flex-1 flex flex-col gap-1'>
                                    <p>Qualification</p>
                                    <input onChange={(e) => setQualification(e.target.value)} value={qualification} className='border rounded px-3 py-2' type="text" placeholder='Qualification' required />
                                </div>
                            </>
                        )}
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>
                            <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='Address 1' required />
                            <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='Address 2' required />
                        </div>
                    </div>
                </div>
                <div>
                    <p className='mt-4 mb-2'>About {state}</p>
                    <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' placeholder={`Write about ${state.toLowerCase()}...`} rows={5} required></textarea>
                </div>
                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full cursor-pointer'>Add {state}</button>
            </div>
        </form>
    )
}

export default AddEmployee