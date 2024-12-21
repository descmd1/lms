import React from 'react';

export function Aboutus() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 md:px-20">
      <h1 className="text-md font-bold text-center text-black mb-4">About Us</h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
        <p className="text-lg text-gray-700">
          Welcome to our Learning Management System (LMS), where education meets technology.
          Our platform is designed to empower learners and educators alike, providing an engaging,
          efficient, and user-friendly experience.
        </p>
        <p className="text-lg text-gray-700">
          Our mission is to make education accessible to everyone, anytime, anywhere. Whether you’re
          a student seeking knowledge or a tutor sharing expertise, our LMS offers the tools and
          resources you need to succeed.
        </p>
        <p className="text-lg text-gray-700">
          Join our growing community and unlock your potential through our innovative platform.
          Together, let's shape the future of learning.
        </p>
        <p className="text-lg text-gray-700 font-semibold">
          Contact us today to learn more about how our LMS can help you achieve your goals!
        </p>
      </div>
    </div>
  );
};


