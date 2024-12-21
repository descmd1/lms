import { useState } from "react";
import { createCourse } from "../api"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";
import { BiUpload } from "react-icons/bi";
import { useTheme } from "../components/ThemeContext";

export function CreateCourse() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [image, setImage] = useState(null);
    const [category, setCategory] = useState("programming"); // Default category
    const [chapters, setChapters] = useState([{ title: "", content: "", video: null }]); // Include video in chapter objects
    const navigate = useNavigate();
    const {theme} = useTheme()

    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Store the selected image file
    };

    const handleChapterChange = (index, field, value) => {
        const updatedChapters = [...chapters];
        updatedChapters[index][field] = value;
        setChapters(updatedChapters);
    };

    // Handle chapter video changes
    const handleChapterVideoChange = (index, e) => {
        const updatedChapters = [...chapters];
        updatedChapters[index].video = e.target.files[0]; // Store the selected video file for the chapter
        setChapters(updatedChapters);
    };

    const addChapter = () => {
        setChapters([...chapters, { title: "", content: "", video: null }]); // Include video in new chapter
    };

    const removeChapter = (index) => {
        const updatedChapters = chapters.filter((_, i) => i !== index);
        setChapters(updatedChapters);
    };

    async function handleSubmit(e) {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData();
        formData.append('image', image);
chapters.forEach((chapter, index) => {
    formData.append(`chapters[${index}][title]`, chapter.title);
    formData.append(`chapters[${index}][content]`, chapter.content);
    formData.append(`chapters[${index}][video]`, chapter.video); // Ensure this is the file
});
        formData.append('title', title);
        formData.append('description', description);
        formData.append('content', content);
        formData.append('price', price);
        formData.append('duration', duration);
        // formData.append('image', image); // Append the image file
        formData.append('category', category); // Append the category
        formData.append('published', false); // Always set published to false during creation
        formData.append('dateCreated', new Date().toISOString()); // Store date as ISO string

        // Append chapters and their videos
        chapters.forEach((chapter, index) => {
            formData.append(`chapters[${index}][title]`, chapter.title);
            formData.append(`chapters[${index}][content]`, chapter.content);
            if (chapter.video) {
                formData.append(`chapters[${index}][video]`, chapter.video); // Append video file for each chapter
            }
        });

        const response = await createCourse(formData); // Send form data to API

        if (response.status === 200) {
            navigate('/home');
        } else {
            console.error("Course creation failed:", response); // Log any errors for debugging
        }
    }

    return (
        <div className={`app-container ${theme} flex justify-center px-4 border shadow-md rounded-md bg-[#fdfdfd] py-4`}>
            <form onSubmit={handleSubmit} className="flex flex-col w-full">
                <input
                    name="title"
                    placeholder="Title"
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                />
                <input
                    name="description"
                    placeholder="Description"
                    maxLength={300}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className={`app-container ${theme} py-3 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                />
                <textarea
                    name="content"
                    placeholder="Write your content"
                    maxLength={3000}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className={`app-container ${theme} py-5 px-4 mb-4 rounded-sm border color dark:bg-gray-900`}
                />
                
                {/* Category selection */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-gray-400 font-normal">Select Category</label>
                    <select
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900 w-full`}
                    >
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="business">Business</option>
                    </select>
                </div>

                {/* Chapters section */}
                <div className="flex flex-col gap-2 mb-4">
                    <label className="text-gray-400 font-normal">Chapters</label>
                    {chapters.map((chapter, index) => (
                        <div key={index} className="flex flex-col gap-2 mb-2">
                            <input
                                name={`chapter-title-${index}`}
                                placeholder={`Chapter ${index + 1} Title`}
                                value={chapter.title}
                                onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                                className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                            />
                            <textarea
                                name={`chapter-content-${index}`}
                                placeholder={`Chapter ${index + 1} Content`}
                                value={chapter.content}
                                onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                                className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                            />
                             <div className="py-2 px-2 mb-2 rounded-sm border">
                             <button className="flex items-center justify-center text-blue-500"><BiUpload/> </button>
                            <label htmlFor={`chapter-video-${index}`} className="text-blue-500 text-md font-light cursor-pointer">Upload Video for Chapter {index + 1}</label>
                            <input
                                type="file"
                                name={`chapter-video-${index}`}
                                accept="video/*"
                                onChange={(e) => handleChapterVideoChange(index, e)}
                                className="hidden"
                                
                            />
                            </div>
                            {chapters.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeChapter(index)}
                                    className="text-red-600 font-semibold"
                                >
                                    Remove Chapter
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addChapter}
                        className="text-blue-600 font-semibold"
                    >
                        Add Chapter
                    </button>
                </div>

                {/* Image Upload */}
                <div className="py-2 px-2 mb-2 rounded-sm border">
                <button className="flex items-center justify-center text-blue-500"><BiUpload/> </button>
                <label htmlFor="image" className="text-blue-500 text-md font-light">Upload Course Image</label>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                />
                </div>
                {/* Price and Duration */}
                <div className="flex flex-col md:flex-row gap-5 w-full">
                    <input
                        name="price"
                        placeholder="Price"
                        maxLength={300}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900 w-full`}
                    />
                    <input
                        name="duration"
                        placeholder="Duration"
                        maxLength={300}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900 w-full`}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 rounded-md mt-2"
                >
                    Create Course
                </button>
            </form>
        </div>
    );
}
