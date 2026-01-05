import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const About = () => {
  return (
    <div className='px-4 md:px-0'>
      <div className='text-center py-12 px-4'>
        <p className='text-5xl md:text-6xl font-bold'>
          <span className='text-gray-500'>ABOUT </span>
          <span className='text-gray-900'>US</span>
        </p>
      </div>

      <div className='my-12 flex flex-col md:flex-row gap-12 md:gap-16 items-center'>
        <img className='w-full md:max-w-[360px] rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300' src={assets.about_image} alt="About us" />
        <div className='flex flex-col justify-center gap-8 md:w-2/4 text-base text-gray-700 leading-relaxed'>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi magnam quo illo dolorem quia perspiciatis quis ex quisquam, quasi adipisci beatae. Explicabo iste eum alias deserunt, exercitationem at facere assumenda?</p>
          <p className='text-gray-600'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Hic dolores quia dicta. Officiis omnis nemo eveniet adipisci veritatis iusto tempore asperiores quasi, perspiciatis molestias exercitationem harum voluptatem suscipit quibusdam. Voluptatem rerum nam harum iure, iusto id distinctio sequi voluptas minima nostrum corporis aspernatur recusandae maiores laborum, aut ab, nobis repellat.</p>
          <div>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>Our Vision</h3>
            <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquam delectus eligendi nemo eius temporibus laudantium totam. Molestiae nihil, aliquam debitis magnam possimus totam voluptatibus ab nemo earum impedit iure.</p>
          </div>
        </div>
      </div>

      <div className='text-center py-12'>
        <h2 className='text-4xl md:text-5xl font-bold'>
          <span className='text-gray-500'>Why </span>
          <span className='text-gray-900'>Choose Us</span>
        </h2>
      </div>

      <div className='flex flex-col md:flex-row gap-6 mb-20'>
        <div className='border border-gray-200 px-8 md:px-12 py-10 sm:py-16 flex flex-col gap-6 text-base rounded-2xl shadow-lg hover:shadow-2xl hover:bg-primary hover:text-white hover:-translate-y-2 transition-all duration-300 text-gray-700 cursor-pointer bg-white'>
          <h3 className='font-bold text-lg'>Efficiency:</h3>
          <p className='text-gray-600 hover:text-white transition-colors'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam labore architecto iste voluptate qui beatae?
          </p>
        </div>
        <div className='border border-gray-200 px-8 md:px-12 py-10 sm:py-16 flex flex-col gap-6 text-base rounded-2xl shadow-lg hover:shadow-2xl hover:bg-primary hover:text-white hover:-translate-y-2 transition-all duration-300 text-gray-700 cursor-pointer bg-white'>
          <h3 className='font-bold text-lg'>Convenience:</h3>
          <p className='text-gray-600 hover:text-white transition-colors'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam labore architecto iste voluptate qui beatae?</p>
        </div>
        <div className='border border-gray-200 px-8 md:px-12 py-10 sm:py-16 flex flex-col gap-6 text-base rounded-2xl shadow-lg hover:shadow-2xl hover:bg-primary hover:text-white hover:-translate-y-2 transition-all duration-300 text-gray-700 cursor-pointer bg-white'>
          <h3 className='font-bold text-lg'>Personalization:</h3>
          <p className='text-gray-600 hover:text-white transition-colors'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam labore architecto iste voluptate qui beatae?</p>
        </div>
      </div>
    </div>
  )
}

export default About
