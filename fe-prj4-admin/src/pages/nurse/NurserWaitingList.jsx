import React, { useContext, useState, useEffect } from 'react'
import { NurseContext } from '../../context/NurseContext';

const NurserWaitingList = () => {

  const { backendNurseUrl, nToken, doctorsList, getDoctorsByNurseCategory } = useContext(NurseContext);

  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    getDoctorsByNurseCategory();
  }, [nToken]);

  const toggleRowExpand = (doctorId) => {
    setExpandedRows(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctors List</h1>

      {doctorsList && doctorsList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doctorsList.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Doctor Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">{doctor.name}</h2>
                    <p className="text-blue-600 font-semibold">{doctor.speciality}</p>
                    <p className="text-gray-600 text-sm mt-1">{doctor.degree}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${doctor.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {doctor.available ? 'Available' : 'Not Available'}
                      </span>
                      <span className="text-gray-700 font-semibold">{doctor.fees} VND</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Experience:</span>
                  <span className="text-gray-800 font-semibold">{doctor.experience}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-800 font-semibold">{doctor.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Address:</span>
                  <span className="text-gray-800 font-semibold text-right">
                    {doctor.address.line1}, {doctor.address.line2}
                  </span>
                </div>
              </div>

              {/* About Section */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => toggleRowExpand(doctor._id)}
                  className="w-full flex items-center justify-between text-left text-gray-800 font-semibold hover:text-blue-600 transition-colors"
                >
                  <span>About</span>
                  <span className={`transform transition-transform ${expandedRows[doctor._id] ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {expandedRows[doctor._id] && (
                  <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                    {doctor.about}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No doctors found</p>
        </div>
      )}
    </div>
  )
}

export default NurserWaitingList