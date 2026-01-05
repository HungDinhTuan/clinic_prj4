import React, { use, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TopDoctors = () => {

  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const displayAvailable = (index) => {
    let isAvailable = "";
    doctors[index].available ? isAvailable = "Available" : isAvailable = "Not Available";
    return isAvailable;
  }

  return (
    <div className='flex flex-col items-center gap-6 my-16 text-gray-900 md:mx-10 px-4 md:px-0'>
      <div className='text-center'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4'>
          Top Doctors To Book
        </h1>
        <p className='sm:w-2/3 text-center text-gray-600 text-base leading-relaxed mx-auto'>
          Simply browse through our extensive list of trusted doctors.
        </p>
      </div>
      <div className='w-full grid grid-cols-auto gap-6 gap-y-8 px-2 sm:px-0'>
        {
          doctors.slice(0, 10).map((doctor, index) => (
            <div onClick={() => { navigate(`/appointment/${doctor._id}`); scrollTo(0, 0) }} className='border border-blue-200 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:translate-y-[-10px] transition-all duration-500 bg-white group' key={index}>
              <img className='bg-blue-50 w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500' src={doctor.image} alt={doctor.name} />
              <div className='p-5'>
                <div className='flex items-center gap-2 text-sm mb-3'>
                  <p className={`w-2.5 h-2.5 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-red-500'}`}></p>
                  <p className={`font-medium ${doctor.available ? 'text-green-600' : 'text-red-600'}`}>{displayAvailable(index)}</p>
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

export default TopDoctors
