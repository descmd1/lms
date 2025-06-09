import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';

export const ViewResource = () => {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
   const {theme} = useTheme()

  // Fetch all resources on component load
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get('http://localhost:5001/resources');
        setResources(res.data);
      } catch (error) {
        console.error('Error fetching resources', error);
      }
    };
    fetchResources();
  }, []);

  // Fetch details of a single resource when clicked
  const viewResourceDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5001/resources/${id}`);
      setSelectedResource(res.data); 

      // Create a base64 data URL for opening in new tab
      const pdfUrl = `data:${res.data.pdfMimeType};base64,${res.data.pdfBase64}`;
      const newTab = window.open();
      newTab.document.write(`<iframe src="${pdfUrl}" width="100%" height="100%" frameborder="0" style="border: none;"></iframe>`);
    } catch (error) {
      console.error('Error fetching resource details', error);
    }
  };

  return (
    <div className={`app-container ${theme} flex flex-col w-full items-start
    shadow-md p-4 rounded-md gap-4 min-h-screen`}>
      <h2 className='text-bold'>View Uploaded Resources</h2>
      <ul className='flex flex-col items-start justify-center shadow-md gap-4'>
        {/* Render list of resource links */}
        {resources.map(resource => (
          <li key={resource._id} className='text-blue-500 underline'>
            <a href="#" onClick={() => viewResourceDetails(resource._id)}>
              {resource.title}
            </a>
          </li>
        ))}
      </ul>
 
      {/* Render the selected resource's PDF */}
      {selectedResource && (
        <div>
          <h3>{selectedResource.title}</h3>
          <embed
            src={`data:${selectedResource.pdfMimeType};base64,${selectedResource.pdfBase64}`}
            width="100%"
            height="500px"
            type={selectedResource.pdfMimeType}
          />
        </div>
      )}
    </div>
  );
};
