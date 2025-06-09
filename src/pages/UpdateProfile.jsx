import React, { useState, useEffect } from "react";
import { Formik, Field, Form } from "formik";
import axios from "axios";
import * as jwt_decode from "jwt-decode";
import { getCourses } from "../api";
import { FaUser } from "react-icons/fa6";
import { useTheme } from "../components/ThemeContext";
import Swal from "sweetalert2";

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
const {theme} = useTheme();
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
            profileImage: null, 
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
    previewFile(file); 
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); 
    reader.onloadend = () => {
      setPreviewSource(reader.result); 
    };
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("role", values.role);

    if (values.profileImage) {
      formData.append("profileImage", values.profileImage); 
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
          Swal.fire({
                          title: "Success",
                          text: "User account updated successfully.",
                          icon: "success",
                          confirmButtonText: "OK",
                      });
        } else {
          Swal.fire({
                          title: "Failed!",
                          text: "User account could not be updated!.",
                          icon: "error",
                          confirmButtonText: "OK",
                      });
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  return (
    <div className={`app-container ${theme} container mx-auto shadow-md p-4 rounded-md`}>
      <h1 className="flex text-2xl text-md font-bold mb-4 items-center justify-center w-full">Update Profile</h1>
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
    <div className={`field-color ${theme} mt-4 h-32 w-32 rounded-full border-2 flex items-center justify-center`}>
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
               <label htmlFor="name" className="text-sm font-semibold">Name</label>
               <Field
                 name="name"
                 className={`field-color ${theme} border p-2 rounded-md text-sm font-normal bg-transparent`}
                 placeholder="Enter your name"
               />
             </div>

             <div className="flex flex-col">
               <label htmlFor="email" className="text-sm font-semibold">Email</label>
               <Field
                 name="email"
                 type="email"
                 className={`field-color ${theme} border p-2 rounded-md text-sm font-normal bg-transparent`}
                 value={initialValues?.email} 
                 disabled 
               />
             </div>

             <div className="flex flex-col">
               <label htmlFor="role" className="text-gray-500 text-sm font-semibold">Role</label>
               <Field
                 name="role"
                 className={`field-color ${theme} border p-2 rounded-md text-sm font-normal bg-transparent`}
                 value={initialValues?.role} 
                 disabled 
              />
             </div>
            <button
              type="submit"
              className={`button-color card-hover ${theme} bg-blue-500 text-white py-2 px-4 rounded-md font-normal text-sm
              transition-colors duration-700`}
            >
              Update Profile
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
