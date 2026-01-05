import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
    return (
        <div className='mt-40'>
            <div className='md:mx-10'>
                <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-12 sm:gap-16 py-12 px-6 md:px-0 text-sm border-t-2 border-gray-200'>
                    {/*----------Left Side----------*/}
                    <div>
                        <img className='mb-6 w-40 hover:opacity-80 transition-opacity duration-300' src={assets.logo1} alt="Doctor Appointment Logo" />
                        <p className='w-full md:w-2/3 text-gray-600 leading-7 text-justify hover:text-gray-700 transition-colors duration-300'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quae ex repudiandae, nulla necessitatibus odit odio. Consectetur perspiciatis quisquam in, aspernatur reiciendis tempore porro sunt vel voluptates magnam, vero libero nobis?</p>
                    </div>
                    {/*----------Center Side----------*/}
                    <div>
                        <p className='text-lg font-bold mb-6 text-gray-900 uppercase tracking-wide'>Company</p>
                        <ul className='flex flex-col gap-3 text-gray-600'>
                            <li><a href="#home" className='hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer'>Home</a></li>
                            <li><a href="#about" className='hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer'>About us</a></li>
                            <li><a href="#contact" className='hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer'>Contact us</a></li>
                            <li><a href="#privacy" className='hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer'>Privacy policy</a></li>
                        </ul>
                    </div>
                    {/*----------Right Side----------*/}
                    <div>
                        <p className='text-lg font-bold mb-6 text-gray-900 uppercase tracking-wide'>Get in Touch</p>
                        <ul className='flex flex-col gap-3 text-gray-600'>
                            <li className='hover:text-primary transition-colors duration-300 flex items-center cursor-pointer'>
                                <span className='mr-3 text-lg'>📞</span>
                                <a href="tel:+84968559431">+84-968-559-431</a>
                            </li>
                            <li className='hover:text-primary transition-colors duration-300 flex items-center cursor-pointer'>
                                <span className='mr-3 text-lg'>✉️</span>
                                <a href="mailto:hungtuandinhbg@gmail.com">hungtuandinhbg@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
                {/*----------Copyright Side----------*/}
                <div className='border-t-2 border-gray-200'>
                    <p className='py-8 text-sm text-center text-gray-500 hover:text-gray-700 transition-colors duration-300'>© 2025 Doctor Appointment. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Footer
