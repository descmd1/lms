import React from 'react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { useTheme } from '../components/ThemeContext';

export function Contact() {
  const {theme} = useTheme();
  return (
    <div className={`app-container ${theme} min-h-screen bg-gray-50 py-10 px-5 md:px-20`}>
      <h1 className="text-2xl font-bold text-center mb-4">Contact Us</h1>
      <div className=" w-full p-3">
        <p className="text-lg mb-6">
          If you have any questions or need assistance, feel free to reach out to us.
        </p>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
                className={`field-color ${theme} w-full border bg-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              className={`field-color ${theme} w-full border bg-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className={`field-color ${theme} w-full border bg-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Your message"
              rows="5"
            ></textarea>
          </div>
          <button
            type="submit"
            className={`button-color card-hover ${theme} w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors duration-700`}
          >
            Send Message
          </button>
        </form>
       
        <div className='flex flex-col w-full justify-start mt-4'>
        <p>You can also reach out to us on our social media platforms below</p>
         <span className='flex gap-4 mt-4'>
            <FaFacebook size={20}/>
            <FaWhatsapp size={20}/>
            </span>
        </div>
      </div>
    </div>
  );
};


