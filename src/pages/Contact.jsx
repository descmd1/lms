import React from 'react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';

export function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 md:px-20">
      <h1 className="text-md font-bold text-center text-black mb-4">Contact Us</h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <p className="text-lg text-gray-700 mb-6">
          If you have any questions or need assistance, feel free to reach out to us.
        </p>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your message"
              rows="5"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
       
        <div>
        <p>You can also reach out to us on our social media platforms below</p>
         <span className='flex gap-4'>
            <FaFacebook size={16}/>
            <FaWhatsapp size={16}/>
            </span>
        </div>
      </div>
    </div>
  );
};


