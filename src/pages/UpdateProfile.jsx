import React, { useState, useEffect } from "react";
import { Formik, Field, Form } from "formik";
import axios from "axios";
import * as jwt_decode from "jwt-decode";
import { getCourses } from "../api";
import { FaUser } from "react-icons/fa6";

export const UpdateProfile = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState({});
  const [previewSource, setPreviewSource] = useState(""); // State for image preview
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    role: "",
    profileImage: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("user");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);
        try {
          const response = await axios.get(`http://localhost:5001/user/${decodedUser._id}`);
          const userData = response.data;
          const allCourses = await getCourses();
          const filteredCourses = allCourses.filter(
            (course) => course.author === decodedUser._id
          );

          setCourses(filteredCourses);
          setUser(decodedUser);

          // Set initial form values with fetched data
          setInitialValues({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            profileImage: null, // Leave this null for the new image upload
          });
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleFileInputChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    setFieldValue("profileImage", file);
    previewFile(file); // Call previewFile function to set preview image
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Convert image to base64 string
    reader.onloadend = () => {
      setPreviewSource(reader.result); // Set the previewSource state
    };
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("role", values.role);

    if (values.profileImage) {
      formData.append("profileImage", values.profileImage); // Append image if uploaded
    }

    const token = sessionStorage.getItem("user");
    if (token) {
      const decodedUser = jwt_decode.jwtDecode(token);
      try {
        const response = await axios.put(
          `http://localhost:5001/user/${decodedUser._id}`,
          formData,
          {
            headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 200) {
          console.log("Profile updated successfully:", response.data);
        } else {
          window.alert("User account could not be updated!");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  return (
    <div className="container mx-auto shadow-md bg-white p-4 rounded-md">
      <h1 className="flex text-2xltext-md font-bold mb-4 items-center justify-center w-full">Update Profile</h1>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-4">
            {/* Other form fields */}

            <div className="flex flex-col items-center justify-center"> 
            {previewSource ? (
    <img
      src={previewSource}
      alt="Selected Profile"
      className="mt-4 h-32 w-32 rounded-full object-cover border"
    />
  ) : (
    <div className="mt-4 h-32 w-32 rounded-full border-2 border-gray-300 flex items-center justify-center">
      <span className="text-gray-500 text-sm"><FaUser size={62}/></span>
    </div>
  )}
              <label htmlFor="profileImage" className="text-blue-400 text-md font-light cursor-pointer">
                Upload Image
              </label>
              <input
               id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={(event) => handleFileInputChange(event, setFieldValue)}
                className="hidden"
              />
            </div>

            <div className="flex flex-col">
               <label htmlFor="name" className="text-gray-500 text-sm font-semibold">Name</label>
               <Field
                 name="name"
                 className="border p-2 rounded-md text-gray-700 text-sm font-normal"
                 placeholder="Enter your name"
               />
             </div>

             <div className="flex flex-col">
               <label htmlFor="email" className="text-gray-500 text-sm font-semibold">Email</label>
               <Field
                 name="email"
                 type="email"
                 className="border p-2 rounded-md text-gray-700 text-sm font-normal"
                 value={initialValues?.email} // Use value instead of placeholder
                 disabled 
               />
             </div>

             <div className="flex flex-col">
               <label htmlFor="role" className="text-gray-500 text-sm font-semibold">Role</label>
               <Field
                 name="role"
                 className="border p-2 rounded-md text-gray-700 text-sm font-normal"
                 value={initialValues?.role} // Use value instead of placeholder
                 disabled 
              />
             </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md font-normal text-sm"
            >
              Update Profile
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
