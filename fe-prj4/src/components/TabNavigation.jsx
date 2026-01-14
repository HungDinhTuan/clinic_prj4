import { useNavigate, useLocation } from 'react-router-dom'

const TabNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex items-center justify-between gap-4 mt-8 pb-6 border-b-2 border-gray-200">
            <button
                onClick={() => navigate('/my-appointments')}
                className={`flex items-center gap-2 px-6 py-3 text-base font-bold rounded-lg transition-all duration-300 ${location.pathname === '/my-appointments'
                    ? 'bg-blue-50 text-primary border-2 border-primary shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50 border-2 border-transparent'
                    }`}
            >
                📋 My Appointments
            </button>
            <button
                onClick={() => navigate('/my-medical-tests')}
                className={`flex items-center gap-2 px-6 py-3 text-base font-bold rounded-lg transition-all duration-300 ${location.pathname === '/my-medical-tests'
                    ? 'bg-blue-50 text-primary border-2 border-primary shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50 border-2 border-transparent'
                    }`}
            >
                📋 My Medical Tests
            </button>
            <button
                onClick={() => navigate('/my-medical-records')}
                className={`flex items-center gap-2 px-6 py-3 text-base font-bold rounded-lg transition-all duration-300 ${location.pathname === '/my-medical-records'
                    ? 'bg-blue-50 text-primary border-2 border-primary shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50 border-2 border-transparent'
                    }`}
            >
                📄 Medical Records
            </button>
        </div>
    )
}

export default TabNavigation
