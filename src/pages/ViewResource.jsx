import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';

const base_url = process.env.REACT_APP_BASE_URL;

export const ViewResource = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { theme } = useTheme();

  // Fetch all resources on component load
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${base_url}/resources`);
        setResources(res.data);
        setFilteredResources(res.data);
      } catch (error) {
        console.error('Error fetching resources', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Filter resources based on search term
  useEffect(() => {
    const filtered = resources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredResources(filtered);
  }, [searchTerm, resources]);

  // Fetch details of a single resource when clicked
  const viewResourceDetails = async (id) => {
    try {
      const res = await axios.get(`${base_url}/resources/${id}`);
      setSelectedResource(res.data);
    } catch (error) {
      console.error('Error fetching resource details', error);
    }
  };

  const openResourceInNewTab = (resource) => {
    const pdfUrl = `data:${resource.pdfMimeType};base64,${resource.pdfBase64}`;
    const newTab = window.open();
    newTab.document.write(`
      <html>
        <head>
          <title>${resource.title}</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .header { 
              background: #f8f9fa; 
              padding: 20px; 
              border-bottom: 1px solid #dee2e6;
              text-align: center;
            }
            .header h1 { 
              margin: 0; 
              color: #333; 
              font-size: 24px;
            }
            .pdf-container { 
              width: 100%; 
              height: calc(100vh - 80px); 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${resource.title}</h1>
          </div>
          <div class="pdf-container">
            <iframe src="${pdfUrl}" width="100%" height="100%" frameborder="0" style="border: none;"></iframe>
          </div>
        </body>
      </html>
    `);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const closeResourceModal = () => {
    setSelectedResource(null);
  };

  if (isLoading) {
    return (
      <div className={`app-container ${theme} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${theme} min-h-screen p-6 relative`}>
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Learning Resources
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Browse and access educational materials
          </p>
        </div>

        {/* Search and Controls */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8 relative z-10`}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`field-color ${theme} w-full pl-10 pr-4 py-2 rounded-lg bg-transparent outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 relative z-0 ${
                  theme === 'dark' 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>View:</span>
              <div className={`flex rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-1`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Resources Display */}
        {filteredResources.length === 0 ? (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
            <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {searchTerm ? 'No resources found' : 'No resources available'}
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Resources will appear here once they are uploaded.'
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredResources.map(resource => (
              <div
                key={resource._id}
                className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} 
                  rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer
                  ${viewMode === 'list' ? 'flex items-center p-4' : 'p-6'}`}
                onClick={() => viewResourceDetails(resource._id)}
              >
                {viewMode === 'grid' ? (
                  <div className="space-y-4">
                    {/* PDF Icon */}
                    <div className={`w-16 h-16 mx-auto flex items-center justify-center rounded-lg ${
                      theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                    }`}>
                      <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-lg font-medium text-center line-clamp-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {resource.title}
                    </h3>
                    
                    {/* Description */}
                    {resource.description && (
                      <p className={`text-sm text-center line-clamp-3 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {resource.description}
                      </p>
                    )}
                    
                    {/* Date */}
                    <p className={`text-xs text-center ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {resource.createdAt && formatDate(resource.createdAt)}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 flex-1">
                    {/* PDF Icon */}
                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 ${
                      theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                    }`}>
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-medium truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {resource.description}
                        </p>
                      )}
                      <p className={`text-xs mt-2 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {resource.createdAt && formatDate(resource.createdAt)}
                      </p>
                    </div>
                    
                    {/* View Icon */}
                    <div className="flex-shrink-0">
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Resource Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <h2 className={`text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {selectedResource.title}
                  </h2>
                  {selectedResource.description && (
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedResource.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openResourceInNewTab(selectedResource)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Open in New Tab
                  </button>
                  <button
                    onClick={closeResourceModal}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="w-full h-96 rounded-lg overflow-hidden">
                  <embed
                    src={`data:${selectedResource.pdfMimeType};base64,${selectedResource.pdfBase64}`}
                    width="100%"
                    height="100%"
                    type={selectedResource.pdfMimeType}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
