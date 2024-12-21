import React, { useState } from 'react';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import { useTheme } from '../components/ThemeContext';

export const Resources = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const {theme} = useTheme()

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("user")
    const decodedUser = jwt_decode.jwtDecode(token)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('pdf', file);
    formData.append('tutorId', decodedUser._id); // Replace with actual tutorId

    try {
      const response = await axios.post('http://localhost:5001/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className={`app-container ${theme} flex flex-col w-full items-center justify-center 
    shadow-md bg-white p-4 rounded-md gap-4 min-h-screen dark:bg-gray-800`}>
        <span className={`app-container ${theme} text-lg font-semibold text-black p-2 dark:text-white`}>Upload Resource 
            <span className={`app-container ${theme} text-md font-normal text-gray-500 dark:text-white`}> (journals, documents, course materials)</span>
            </span>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>
        <input
          type="text"
          placeholder="Enter resource title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border dark:bg-gray-800 dark:text-white`}
        />
        <input type="file" accept=".pdf" onChange={handleFileChange} required />
        <button type="submit" className='flex bg-blue-400 items-center justify-center 
        py-2 px-3 hover:bg-purple-300 text-md font-light text-white
        rounded-md'
        >Upload</button>
      </form>
    </div>
  );
};


