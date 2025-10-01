import React, { useState, useRef } from 'react';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import { useTheme } from '../components/ThemeContext';
import swal from 'sweetalert2';

const base_url = process.env.REACT_APP_BASE_URL;

export const Resources = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      swal.fire({
        title: 'Invalid File',
        text: 'Please select a PDF file only.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setFile(pdfFile);
    } else {
      swal.fire({
        title: 'Invalid File',
        text: 'Please drop a PDF file only.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      swal.fire({
        title: 'No File Selected',
        text: 'Please select a PDF file to upload.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const token = sessionStorage.getItem("user");
    const decodedUser = jwt_decode.jwtDecode(token);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('pdf', file);
    formData.append('tutorId', decodedUser._id);

    try {
      const response = await axios.post(`${base_url}/resources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.status === 200) {
        swal.fire({
          title: 'Success!',
          text: 'Resource uploaded successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        // Reset form
        setTitle('');
        setDescription('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      swal.fire({
        title: 'Upload Failed',
        text: 'There was an error uploading your resource. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`app-container ${theme} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Upload Learning Resource
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Share educational materials with your students
          </p>
        </div>

        {/* Upload Form */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Resource Title *
              </label>
              <input
                type="text"
                placeholder="Enter a descriptive title for your resource"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`field-color ${theme} w-full py-3 px-4 rounded-lg bg-transparent outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Description Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                placeholder="Brief description of the resource content (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className={`field-color ${theme} w-full py-3 px-4 rounded-lg bg-transparent outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 resize-none ${
                  theme === 'dark' 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                PDF File *
              </label>
              
              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {!file ? (
                  <div className="space-y-4">
                    <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {isDragActive ? 'Drop your PDF file here' : 'Drag and drop your PDF file here'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        or click to browse files
                      </p>
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        PDF files only • Max size: 50MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${
                      theme === 'dark' ? 'bg-green-800' : 'bg-green-100'
                    }`}>
                      <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {file.name}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatFileSize(file.size)}
                      </p>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm font-medium"
                        disabled={isUploading}
                      >
                        Remove file
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                    Uploading...
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUploading || !file || !title.trim()}
                className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                  isUploading || !file || !title.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Upload Resource'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


