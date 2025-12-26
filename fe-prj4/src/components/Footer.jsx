import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/*----------Left Side----------*/}
                <div>
                    <img className='mb-5 w-40' src={assets.logo1} alt="" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quae ex repudiandae, nulla necessitatibus odit odio. Consectetur perspiciatis quisquam in, aspernatur reiciendis tempore porro sunt vel voluptates magnam, vero libero nobis?</p>
                </div>
                {/*----------Center Side----------*/}
                <div>
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Contact us</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                {/*----------Right Side----------*/}
                <div>
                    <p className='text-xl font-medium mb-5'>Contact With Us</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>+84-968-559-431</li>
                        <li>hungtuandinhbg@gmail.com</li>
                    </ul>
                </div>
            </div>
            {/*----------Copyright Side----------*/}
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>© 2025 Doctor Appointment. All rights reserved.</p>
            </div>
        </div>
    )
}

export default Footer
