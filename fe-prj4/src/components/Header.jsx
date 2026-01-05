import { assets } from '../assets/assets_frontend/assets'

const Header = () => {
  return (
    <div className='flex flex-col md:flex-row flex-wrap bg-primary rounded-2xl px-6 md:px-10 lg:px-20 shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300 mt-8 mx-4 md:mx-10 lg:mx-20'>
      {/* ---------Left Section--------- */}
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 py-10 m-auto md:py-[10vw] md:mb-[-30px] z-10'>
        <p className='text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-snug lg:leading-tight'>
          Book Appointment <br /> <span className='bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>With Trusted Doctors</span>
        </p>
        <div className='flex flex-col md:flex-row items-center gap-4 text-white text-sm font-medium'>
          <img className='w-28 drop-shadow-lg' src={assets.group_profiles} alt="Trusted doctors" />
          <p className='leading-relaxed'>Simply browse through our extensive list of trusted doctors, <br className='hidden sm:block' /> schedule your appointment hassle-free.</p>
        </div>
        <a href="#findDoctor" className='flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-full font-semibold text-sm m-auto md:m-0 shadow-lg hover:shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer'>
          Book appointment <img className='w-3' src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* ---------Right Section--------- */}
      <div className='md:w-1/2 relative overflow-hidden'>
        <img className='w-full md:absolute bottom-0 h-auto rounded-lg md:rounded-none shadow-xl md:shadow-none transition-transform duration-300 hover:scale-105' src={assets.header_img} alt="Doctor consultation" />
      </div>
    </div>
  )
}

export default Header
