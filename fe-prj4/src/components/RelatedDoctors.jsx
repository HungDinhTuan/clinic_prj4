import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const RelatedDoctors = ({ docId, speciality }) => {
    const { doctors } = useContext(AppContext);
    const navigate = useNavigate();

    const [relDocs, setRelDocs] = useState([]);

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter(doc => doc.speciality === speciality && doc._id !== docId);
            setRelDocs(doctorsData);
        }
    }, [doctors, docId, speciality]);

    return (
        <div className='flex flex-col items-center gap-6 my-16 text-gray-900 md:mx-10 px-4 md:px-0'>
            <div className='text-center'>
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                    Related Doctors
                </h1>
                <p className='sm:w-2/3 text-center text-gray-600 text-base leading-relaxed mx-auto'>
                    Simply browse through our extensive list of trusted doctors.
                </p>
            </div>
            <div className='w-full grid grid-cols-auto gap-6 gap-y-8 px-2 sm:px-0'>
                {
                    relDocs.slice(0, 5).map((doctor, index) => (
                        <div onClick={() => { navigate(`/appointment/${doctor._id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }} className='border border-blue-200 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:translate-y-[-10px] transition-all duration-500 bg-white group' key={index}>
                            <img className='bg-blue-50 w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500' src={doctor.image} alt={doctor.name} />
                            <div className='p-5'>
                                <div className='flex items-center gap-2 text-sm mb-3'>
                                    <p className='w-2.5 h-2.5 bg-green-500 rounded-full'></p>
                                    <p className='font-medium text-green-600'>Available</p>
                                </div>
                                <p className='text-gray-900 text-lg font-bold mb-1'>{doctor.name}</p>
                                <p className='text-gray-500 text-sm'>{doctor.speciality}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-blue-50 text-gray-700 font-semibold px-12 py-3 rounded-full mt-10 cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-100 hover:text-primary transition-all duration-300 active:scale-95'>See more</button>
        </div>
    )
}

export default RelatedDoctors
