import { useState } from "react";
import { createCourse } from "../api";
import { useNavigate } from "react-router-dom";
import { BiUpload } from "react-icons/bi";
import { useTheme } from "../components/ThemeContext";
import { ScheduleLiveSession } from "../components/ScheduleLiveSession";
import Swal from "sweetalert2";


export function CreateCourse() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [image, setImage] = useState(null);
    const [category, setCategory] = useState("programming");
    const [chapters, setChapters] = useState([
        { title: "", content: "", video: null },
    ]);
    const [includesLiveSessions, setIncludesLiveSessions] = useState(false);
    const [courseId, setCourseId] = useState(null);
    const [showLiveSessionForm, setShowLiveSessionForm] = useState(false);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB for images)
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire({
                    title: 'File Too Large',
                    text: 'Please select an image smaller than 10MB',
                    icon: 'warning'
                });
                e.target.value = '';
                return;
            }
        }
        setImage(file);
    };

    const handleChapterChange = (index, field, value) => {
        const updatedChapters = [...chapters];
        updatedChapters[index][field] = value;
        setChapters(updatedChapters);
    };

    // Handle chapter video changes
    const handleChapterVideoChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 100MB for videos)
            if (file.size > 100 * 1024 * 1024) {
                Swal.fire({
                    title: 'File Too Large',
                    text: 'Please select a video smaller than 100MB',
                    icon: 'warning'
                });
                e.target.value = '';
                return;
            }
        }
        const updatedChapters = [...chapters];
        updatedChapters[index].video = file;
        setChapters(updatedChapters);
    };

    const addChapter = () => {
        setChapters([...chapters, { title: "", content: "", video: null }]);
    };

    const removeChapter = (index) => {
        const updatedChapters = chapters.filter((_, i) => i !== index);
        setChapters(updatedChapters);
    };

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Show initial loading message
            Swal.fire({
                title: 'Uploading Course...',
                text: 'Please wait while we upload your files. This may take a few minutes.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData();
        formData.append("image", image);
        chapters.forEach((chapter, index) => {
            formData.append(`chapters[${index}][title]`, chapter.title);
            formData.append(`chapters[${index}][content]`, chapter.content);
            formData.append(`chapters[${index}][video]`, chapter.video);
        });
        formData.append("title", title);
        formData.append("description", description);
        formData.append("content", content);
        formData.append("price", price);
        formData.append("duration", duration);
        formData.append("category", category);
        formData.append("published", false);
        formData.append("dateCreated", new Date().toISOString());

        // Append chapters and their videos
        chapters.forEach((chapter, index) => {
            formData.append(`chapters[${index}][title]`, chapter.title);
            formData.append(`chapters[${index}][content]`, chapter.content);
            if (chapter.video) {
                formData.append(`chapters[${index}][video]`, chapter.video);
            }
        });

        const response = await createCourse(formData);
        
        Swal.close(); // Close the loading dialog
        setIsUploading(false);

        if (response.status === 200) {
            setCourseId(response.data.insertedId);
            
            if (includesLiveSessions) {
                Swal.fire({
                    title: "Course Created!",
                    text: "Course created successfully! Now you can schedule live sessions.",
                    icon: "success",
                    confirmButtonText: "Schedule Live Sessions",
                    showCancelButton: true,
                    cancelButtonText: "Skip for Now"
                }).then((result) => {
                    if (result.isConfirmed) {
                        setShowLiveSessionForm(true);
                    } else {
                        navigate("/home");
                    }
                });
            } else {
                Swal.fire({
                    title: "Good job!",
                    text: "Course created successfully!",
                    icon: "success",
                    confirmButtonText: "OK",
                });
                navigate("/home");
            }
        } else {
            Swal.fire({
                title: "Failed!",
                text: "Course creation failed!",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
        } catch (error) {
            console.error('Course creation error:', error);
            setIsUploading(false);
            Swal.close();
            
            let errorMessage = 'Course creation failed!';
            if (error.response?.status === 408) {
                errorMessage = 'Upload timeout! Please try with smaller files or check your internet connection.';
            } else if (error.response?.status === 413) {
                errorMessage = 'Files are too large! Please upload smaller files (max 500MB total).';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Upload timeout! Please try again with smaller files.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Swal.fire({
                title: "Upload Failed!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }

    return (
        <div
            className={`app-container ${theme} flex justify-center px-4 py-4 rounded-md 
              shadow-lg`}
        >
            <form onSubmit={handleSubmit} className="flex flex-col w-full">
                <input
                    name="title"
                    placeholder="Title"
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm color bg-transparent outline-none`}
                />
                <input
                    name="description"
                    placeholder="Description"
                    maxLength={300}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className={`field-color ${theme} py-3 px-3 mb-4 rounded-sm color bg-transparent outline-none`}
                />
                <textarea
                    name="content"
                    placeholder="Write your content"
                    maxLength={3000}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className={`field-color ${theme} py-5 px-4 mb-4 rounded-sm color bg-transparent outline-none`}
                />

                {/* Category selection */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-gray-400 font-normal">
                        Select Category
                    </label>
                    <select
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm color bg-transparent outline-none`}
                    >
                        <option
                            value="programming"
                            className={`layout-container ${theme}`}
                        >
                            Programming
                        </option>
                        <option
                            value="design"
                            className={`layout-container ${theme}`}
                        >
                            Design
                        </option>
                        <option
                            value="marketing"
                            className={`layout-container ${theme}`}
                        >
                            Marketing
                        </option>
                        <option
                            value="business"
                            className={`layout-container ${theme}`}
                        >
                            Business
                        </option>
                    </select>
                </div>

                {/* Live Sessions Option */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        id="includesLiveSessions"
                        checked={includesLiveSessions}
                        onChange={(e) => setIncludesLiveSessions(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="includesLiveSessions" className="text-gray-400 font-normal">
                        This course will include live video sessions
                    </label>
                </div>

                {/* Chapters section */}
                <div className="flex flex-col gap-2 mb-4">
                    <label className="text-gray-400 font-normal">
                        Chapters
                    </label>
                    {chapters.map((chapter, index) => (
                        <div key={index} className="flex flex-col gap-2 mb-2">
                            <input
                                name={`chapter-title-${index}`}
                                placeholder={`Chapter ${index + 1} Title`}
                                value={chapter.title}
                                onChange={(e) =>
                                    handleChapterChange(
                                        index,
                                        "title",
                                        e.target.value
                                    )
                                }
                                className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm color bg-transparent outline-none`}
                            />
                            <textarea
                                name={`chapter-content-${index}`}
                                placeholder={`Chapter ${index + 1} Content`}
                                value={chapter.content}
                                onChange={(e) =>
                                    handleChapterChange(
                                        index,
                                        "content",
                                        e.target.value
                                    )
                                }
                                className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm color bg-transparent outline-none`}
                            />
                            <div className="py-2 px-2 mb-2 rounded-sm">
                                <button className="flex items-center justify-center text-blue-500">
                                    <BiUpload />{" "}
                                </button>
                                <label
                                    htmlFor={`chapter-video-${index}`}
                                    className="text-blue-500 text-md font-light cursor-pointer"
                                >
                                    Upload Video for Chapter {index + 1}{" "}
                                </label>
                                <input
                                    type="file"
                                    id={`chapter-video-${index}`}
                                    name={`chapter-video-${index}`}
                                    accept="video/*"
                                    onChange={(e) =>
                                        handleChapterVideoChange(index, e)
                                    }
                                    // className="hidden"
                                    required
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
                <div className="py-2 px-2 mb-2 rounded-sm">
                    <button className="flex items-center justify-center text-blue-500">
                        <BiUpload />{" "}
                    </button>
                    <label
                        htmlFor="image"
                        className="text-blue-500 text-md font-light"
                    >
                        Upload Course Image{" "}
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        // className="hidden"
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
                        className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm color w-full bg-transparent outline-none`}
                    />
                    <input
                        name="duration"
                        placeholder="Duration"
                        maxLength={300}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm color w-full bg-transparent outline-none`}
                    />
                </div>
                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isUploading}
                    className={`button-color ${theme} bg-blue-500 text-white hover:bg-gray-500 transition-colors duration-700 py-3 rounded-md mt-2 relative ${
                        isUploading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                    {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Uploading... Please wait</span>
                        </div>
                    ) : (
                        'Create Course'
                    )}
                </button>
                
                {/* Upload Progress Indicator */}
                {isUploading && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <p className="text-blue-800 text-sm mb-2">
                            📤 Uploading your course files to cloud storage...
                        </p>
                        <div className="text-xs text-blue-600">
                            <p>• Large files may take several minutes to upload</p>
                            <p>• Please keep this page open during upload</p>
                            <p>• Ensure stable internet connection</p>
                        </div>
                    </div>
                )}
            </form>

            {/* Live Session Scheduling Form */}
            {showLiveSessionForm && courseId && (
                <div className="mt-8">
                    <ScheduleLiveSession 
                        courseId={courseId}
                        onSessionScheduled={() => {
                            Swal.fire({
                                title: "Success!",
                                text: "Live session scheduled successfully!",
                                icon: "success",
                                confirmButtonText: "OK"
                            }).then(() => {
                                navigate("/home");
                            });
                        }}
                    />
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate("/home")}
                            className={`fade-color ${theme} underline hover:text-blue-500 transition-colors`}
                        >
                            Skip and go to home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
