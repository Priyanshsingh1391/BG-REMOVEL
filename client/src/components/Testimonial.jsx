import React from 'react';
import { testimonialsData } from '../assets/assets';

const Testimonial = () => {
  return (
    <div className='py-10'>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent'>
        Customer Testimonials
      </h1>

      {/* Grid Layout */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 py-10'>
        {testimonialsData.map((item, index) => (
          <div 
            key={index}
            className='bg-white rounded-xl p-6 drop-shadow-md hover:scale-105 transition-all duration-700 mx-auto w-full max-w-md'>

            <p className='text-4xl text-gray-500 leading-none'>”</p>
            <p className='text-sm text-gray-600 italic'>{item.text}</p>

            <div className='flex items-center gap-3 mt-5'>
              <img 
                src={item.image} 
                alt={item.author} 
                className='rounded-full w-14 h-14 object-cover border'
              />
              <div>
                <p className='font-semibold text-gray-900'>{item.author}</p>
                <p className='text-gray-500 text-sm'>{item.jobTitle}</p>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
