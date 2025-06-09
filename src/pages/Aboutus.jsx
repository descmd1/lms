import React from 'react';
import { useTheme } from '../components/ThemeContext';

export function Aboutus() {
  const {theme} = useTheme();
  return (
    <div className={`app-container ${theme} min-h-screen bg-gray-50 py-10 px-5 md:px-20`}>
      <h1 className="text-2xl font-semibold text-center mb-4">About Us</h1>
      <div className="w-full p-3 space-y-6">
        <p className="text-xl font-light">
          Welcome to our Learning Management System (LMS), where education meets technology.
          Our platform is designed to empower learners and educators alike, providing an engaging,
          efficient, and user-friendly experience.
        </p>
        <p className="text-xl font-light">
          Our mission is to make education accessible to everyone, anytime, anywhere. Whether you're
          a student seeking knowledge or a tutor sharing expertise, our LMS offers the tools and
          resources you need to succeed.
        </p>
        <p className="text-xl font-light">
          Join our growing community and unlock your potential through our innovative platform.
          Together, let's shape the future of learning.
        </p>
        <p className="text-xl font-light">
          Contact us today to learn more about how our LMS can help you achieve your goals!
        </p>
      </div>
    </div>
  );
};


