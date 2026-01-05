import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Doctors = () => {

  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doctor => doctor.speciality.toLowerCase() === speciality.toLowerCase()));
    } else {
      setFilterDoc(doctors);
    }
  }

  const displayAvailable = (index) => {
    let isAvailable = "";
    doctors[index].available ? isAvailable = "Available" : isAvailable = "Not Available";
    return isAvailable;
  }

  useEffect(() => {
    applyFilter();
  }, [speciality, doctors]);

  return (
    <div className='max-w-7xl mx-auto p-4'>
      <p className='text-gray-700 font-semibold text-lg mb-6'>👨‍⚕️ Browse through our specialist doctors</p>
      <div className='flex flex-col sm:flex-row gap-6'>
        {/* Filter Section */}
        <div className='sm:w-48 flex-shrink-0'>
          <button
            className={`w-full py-2 px-4 border-2 rounded-lg text-base font-semibold transition-all sm:hidden mb-4 ${showFilter
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
            onClick={() => setShowFilter(prev => !prev)}
          >
            🔍 {showFilter ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className={`flex flex-col gap-3 ${showFilter ? 'flex' : 'hidden sm:flex'
            }`}>
            <p className='font-bold text-gray-800 uppercase tracking-wide text-sm mb-2'>Speciality</p>
            {[
              { label: '👨‍⚕️ General Physician', value: 'General physician' },
              { label: '👩‍⚕️ Gynecologist', value: 'Gynecologist' },
              { label: '💅 Dermatologist', value: 'Dermatologist' },
              { label: '👶 Pediatricians', value: 'Pediatricians' },
              { label: '🧠 Neurologist', value: 'Neurologist' },
              { label: '🍽️ Gastroenterologist', value: 'Gastroenterologist' },
            ].map((item) => (
              <p
                key={item.value}
                onClick={() => speciality === item.value ? navigate('/doctors') : navigate(`/doctors/${item.value}`)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 font-medium ${speciality === item.value
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50'
                  }`}
              >
                {item.label}
              </p>
            ))}
          </div>
        </div>
        {/* Doctors Grid */}
        <div className='flex-1'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filterDoc.length > 0 ? (
              filterDoc.map((doctor, index) => (
                <div
                  onClick={() => navigate(`/appointment/${doctor._id}`)}
                  className='bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2'
                  key={index}
                >
                  <div className='relative bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden aspect-square'>
                    <img
                      className='w-full h-full object-cover'
                      src={doctor.image}
                      alt={doctor.name}
                    />
                    {/* Availability Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${doctor.available
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${doctor.available ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                      {doctor.available ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                  <div className='p-5'>
                    <h3 className='text-lg font-bold text-neutral-900'>{doctor.name}</h3>
                    <p className='text-primary font-semibold text-sm mt-1'>{doctor.speciality}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-full py-12 text-center'>
                <p className='text-gray-500 text-lg font-medium'>No doctors found in this speciality</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Doctors
