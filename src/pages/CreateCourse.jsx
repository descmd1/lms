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
    const [category, setCategory] = useState("Science");
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8`}>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                        Create New Course
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Title *
                                </label>
                                <input
                                    name="title"
                                    placeholder="Enter course title"
                                    maxLength={100}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Description *
                                </label>
                                <input
                                    name="description"
                                    placeholder="Brief description of the course"
                                    maxLength={300}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Content *
                                </label>
                                <textarea
                                    name="content"
                                    placeholder="Detailed content description"
                                    maxLength={3000}
                                    rows={6}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                />
                            </div>
                        </div>

                        {/* Category selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Course Category *
                            </label>
                            <select
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                        <option value="Science">
                            Science
                        </option>
                        <option value="Art">
                            Art
                        </option>
                        <option value="Management Science">
                            Management Science
                        </option>
                        <option value="Law">
                            Law
                        </option>
                        <option value="Engineering">
                            Engineering
                        </option>
                        <option value="Agriculture">
                            Agriculture
                        </option>
                        <option value="IT">
                            IT
                        </option>
                        <option value="Craftmanship">
                            Craftmanship
                        </option>
                        <option value="Entrepreneurship">
                            Entrepreneurship
                        </option>
                    </select>
                </div>

                        {/* Live Sessions Option */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <input
                                type="checkbox"
                                id="includesLiveSessions"
                                checked={includesLiveSessions}
                                onChange={(e) => setIncludesLiveSessions(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="includesLiveSessions" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                This course will include live video sessions
                            </label>
                        </div>

                        {/* Chapters section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Course Chapters *
                            </label>
                            {chapters.map((chapter, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4 border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                        Chapter {index + 1}
                                    </h4>
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
                                        className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                    <textarea
                                        name={`chapter-content-${index}`}
                                        placeholder={`Chapter ${index + 1} Content`}
                                        value={chapter.content}
                                        rows={4}
                                        onChange={(e) =>
                                            handleChapterChange(
                                                index,
                                                "content",
                                                e.target.value
                                            )
                                        }
                                        className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    />
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                        <div className="flex flex-col items-center gap-2">
                                            <BiUpload className="text-2xl text-blue-500" />
                                            <label
                                                htmlFor={`chapter-video-${index}`}
                                                className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:text-blue-700 transition-colors"
                                            >
                                                Upload Video for Chapter {index + 1}
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Max size: 100MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            id={`chapter-video-${index}`}
                                            name={`chapter-video-${index}`}
                                            accept="video/*"
                                            onChange={(e) =>
                                                handleChapterVideoChange(index, e)
                                            }
                                            className="hidden"
                                            required
                                        />
                                    </div>
                                    
                                    {chapters.length > 1 && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeChapter(index)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                            >
                                                Remove Chapter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={addChapter}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                                >
                                    <span className="text-lg">+</span>
                                    Add Chapter
                                </button>
                            </div>
                        </div>
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Course Image *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <div className="flex flex-col items-center gap-3">
                                    <BiUpload className="text-3xl text-blue-500" />
                                    <div>
                                        <label
                                            htmlFor="image"
                                            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:text-blue-700 transition-colors"
                                        >
                                            Upload Course Image
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    required
                                />
                            </div>
                        </div>
                        {/* Price and Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Price *
                                </label>
                                <input
                                    name="price"
                                    type="number"
                                    placeholder="Enter price (USD)"
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Duration *
                                </label>
                                <input
                                    name="duration"
                                    placeholder="e.g., 8 weeks, 3 months"
                                    onChange={(e) => setDuration(e.target.value)}
                                    required
                                    className="w-full py-3 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>
                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                            <button
                                type="submit"
                                disabled={isUploading}
                                className={`w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Uploading... Please wait</span>
                                    </>
                                ) : (
                                    'Create Course'
                                )}
                            </button>
                        </div>
                        
                        {/* Upload Progress Indicator */}
                        {isUploading && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                                    📤 Uploading your course files to cloud storage...
                                </p>
                                <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                                    <p>• Large files may take several minutes to upload</p>
                                    <p>• Please keep this page open during upload</p>
                                    <p>• Ensure stable internet connection</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Live Session Scheduling Form */}
                {showLiveSessionForm && courseId && (
                    <div className="mt-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
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
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => navigate("/home")}
                                    className={`text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors`}
                                >
                                    Skip and go to home
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
