import { specialityData } from '../assets/assets_frontend/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-6 py-16 text-gray-800 px-4 md:px-0' id='speciality'>
      <div className='text-center'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4'>Find by Speciality</h1>
        <p className='sm:w-2/3 text-center text-gray-600 text-base leading-relaxed mx-auto'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
      </div>
      <div className='flex sm:justify-center gap-6 pt-8 w-full overflow-x-auto pb-4 scrollbar-hide'>
        {
          specialityData.map((item, index) => (
            <Link onClick={() => scroll(0, 0)} className='flex flex-col items-center text-xs cursor-pointer shrink-0 group hover:translate-y-[-10px] transition-all duration-500' key={index} to={`/doctors/${item.speciality}`}>
              <div className='bg-blue-50 rounded-2xl p-4 mb-3 shadow-md group-hover:shadow-lg group-hover:bg-blue-100 transition-all duration-300'>
                <img className='w-16 sm:w-24 group-hover:scale-110 transition-transform duration-300' src={item.image} alt={item.speciality} />
              </div>
              <p className='font-semibold text-gray-800 text-center group-hover:text-primary transition-colors duration-300'>{item.speciality}</p>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default SpecialityMenu
