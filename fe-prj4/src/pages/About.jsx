import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi magnam quo illo dolorem quia perspiciatis quis ex quisquam, quasi adipisci beatae. Explicabo iste eum alias deserunt, exercitationem at facere assumenda?</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Hic dolores quia dicta. Officiis omnis nemo eveniet adipisci veritatis iusto tempore asperiores quasi, perspiciatis molestias exercitationem harum voluptatem suscipit quibusdam. Voluptatem rerum nam harum iure, iusto id distinctio sequi voluptas minima nostrum corporis aspernatur recusandae maiores laborum, aut ab, nobis repellat.</p>
          <b>Our vision</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquam delectus eligendi nemo eius temporibus laudantium totam. Molestiae nihil, aliquam debitis magnam possimus totam voluptatibus ab nemo earum impedit iure.</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>Why <span className='text-gray-700 font-semibold'>Choose Us</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Efficiency:</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam labore architecto iste voluptate qui beatae?
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Convenience:</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam labore architecto iste voluptate qui beatae?</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Personalization:</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam labore architecto iste voluptate qui beatae?</p>
        </div>
        <div></div>
      </div>
    </div>
  )
}

export default About
