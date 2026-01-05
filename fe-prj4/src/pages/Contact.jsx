import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Contact = () => {
  return (
    <div className='px-4 md:px-0'>
      <div className='text-center py-12 px-4'>
        <p className='text-5xl md:text-6xl font-bold'>
          <span className='text-gray-500'>CONTACT </span>
          <span className='text-gray-900'>US</span>
        </p>
      </div>

      <div className='my-12 flex flex-col md:flex-row gap-12 md:gap-16 mb-28'>
        <img className='w-full md:max-w-[360px] rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 h-auto object-cover' src={assets.contact_image} alt="Contact us location" />

        <div className='flex flex-col justify-center items-start gap-8'>
          <div className='space-y-3'>
            <p className='font-bold text-2xl text-gray-900'>Our Office</p>
            <p className='text-base text-gray-600 leading-relaxed'>Cổng số 1, Nhà E, Toà nhà FPT Polytechnic, <br /> Trịnh Văn Bô, Phường Xuân Phương, TP Hà Nội</p>
          </div>

          <div className='space-y-3 pt-4 border-t border-gray-200'>
            <div>
              <p className='text-base text-gray-600'>
                <span className='font-semibold text-gray-900'>Phone:</span> <a href="tel:0968559431" className='hover:text-primary transition-colors duration-300'>0968-559-431</a>
              </p>
              <p className='text-base text-gray-600'>
                <span className='font-semibold text-gray-900'>Email:</span> <a href="mailto:hungtuandinhbg@gmail.com" className='hover:text-primary transition-colors duration-300'>hungtuandinhbg@gmail.com</a>
              </p>
            </div>
          </div>

          <div className='space-y-4 pt-6 w-full'>
            <div>
              <p className='font-bold text-2xl text-gray-900 mb-2'>Careers at TRUST ME CLINIC</p>
              <p className='text-base text-gray-600 leading-relaxed'>Learn more about our team and job openings.</p>
            </div>
            <button className='border-2 border-gray-900 px-8 py-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer w-full md:w-auto'>Explore Jobs</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
