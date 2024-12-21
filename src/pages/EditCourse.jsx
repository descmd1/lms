import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateCourse, getCourse } from "../api";
import { useTheme } from "../components/ThemeContext";

export function EditCourse() {
    const { id } = useParams(); // Get course ID from URL params
    const navigate = useNavigate();
    const {theme} = useTheme()

    // State to store course data
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        content: "",
        price: "",
        duration: "",
        image: null,
        category: "",
        published: false,
        chapters: [], // Initialize chapters as an empty array
    });

    const [isLoading, setIsLoading] = useState(true); // Loading state to prevent rendering before data is fetched

    // Fetch course data when component mounts
    useEffect(() => {
        async function loadCourse() {
            try {
                const data = await getCourse(id);  // Fetch course data by ID
                setCourseData(data);  // Set fetched data in state
                setIsLoading(false);  // Set loading to false once data is fetched
            } catch (error) {
                console.error("Error fetching course:", error);
                setIsLoading(false);  // Set loading to false even if there's an error
            }
        }
        loadCourse();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => ({
            ...prevData,
            [name]: value, // Update the specific input field in state
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setCourseData((prevData) => ({
            ...prevData,
            [name]: files[0], // Update file input (image or video)
        }));
    };

    const handleChapterChange = (index, e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => {
            const chapters = [...prevData.chapters];
            chapters[index] = { ...chapters[index], [name]: value }; // Update chapter field
            return { ...prevData, chapters };
        });
    };

    const handleChapterFileChange = (index, e) => {
        const { name, files } = e.target;
        setCourseData((prevData) => {
            const chapters = [...prevData.chapters];
            chapters[index] = { ...chapters[index], [name]: files[0] }; // Update chapter video
            return { ...prevData, chapters };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(courseData).forEach((key) => {
            if (key === 'chapters') {
                courseData.chapters.forEach((chapter, index) => {
                    if (chapter.video) {
                        formData.append(`chapters[${index}][video]`, chapter.video); // Append video
                    }
                    formData.append(`chapters[${index}][title]`, chapter.title); // Append chapter title if needed
                });
            } else if (courseData[key] !== null && courseData[key] !== undefined) {
                formData.append(key, courseData[key]);  // Append all form data
            }
        });

        try {
            await updateCourse(id, formData);  // Update course API call
            navigate("/home");  // Redirect after successful update
        } catch (error) {
            console.error("Error updating course:", error);
        }
    };

    // If data is still loading, display a loading message or spinner
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`app-container ${theme} flex justify-center items-center px-4 py-4 
        rounded-md border shadow-2xl bg-[#fdfdfd] dark:bg-gray-800`}>
            <form onSubmit={handleSubmit} className="flex flex-col w-full shadow-sm">
                <input
                    name="title"
                    placeholder="Title"
                    maxLength={100}
                    value={courseData.title}  // Set input value from fetched data
                    onChange={handleInputChange}
                    required
                    className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                />
                <input
                    name="description"
                    placeholder="Description"
                    maxLength={300}
                    value={courseData.description}  // Set input value from fetched data
                    onChange={handleInputChange}
                    required
                    className={`app-container ${theme} py-3 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                />
                <textarea
                    name="content"
                    placeholder="Write your content"
                    maxLength={3000}
                    value={courseData.content}  // Set textarea value from fetched data
                    onChange={handleInputChange}
                    required
                    className={`app-container ${theme} py-5 px-4 mb-4 rounded-sm border color dark:bg-gray-900`}
                />
                {/* Category selection */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-gray-400 font-normal">Select Category</label>
                    <select
                        name="category"
                        value={courseData.category}  // Set selected category from fetched data
                        onChange={handleInputChange}
                        required
                        className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                    >
                        <option value="">Select a category</option>
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="business">Business</option>
                    </select>
                </div>

                {/* Chapters Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Chapters</h3>
                    {courseData.chapters.map((chapter, index) => (
                        <div key={index} className="border p-3 rounded">
                            <input
                                name="title"
                                placeholder="Chapter Title"
                                value={chapter.title}  // Set chapter title from fetched data
                                onChange={(e) => handleChapterChange(index, e)}
                                required
                                className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900 w-full`}
                            />
                            <input
                                type="file"
                                name="video"
                                accept="video/*"
                                onChange={(e) => handleChapterFileChange(index, e)}  // Handle file input for chapter video
                                className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900 w-full`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-5 w-full">
                    <input
                        name="price"
                        placeholder="Price"
                        value={courseData.price}  // Set input value from fetched data
                        onChange={handleInputChange}
                        required
                        className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                    />
                    <input
                        name="duration"
                        placeholder="Duration"
                        value={courseData.duration}  // Set input value from fetched data
                        onChange={handleInputChange}
                        required
                        className={`app-container ${theme} py-2 px-3 mb-4 rounded-sm border color dark:bg-gray-900`}
                    />
                </div>
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        checked={courseData.published}  // Set checkbox value from fetched data
                        onChange={(e) => setCourseData({ ...courseData, published: e.target.checked })}
                    />
                    <label className="ml-2">Publish this course</label>
                </div>
                <button type="submit" className="p-3 bg-blue-400 text-white">Update Course</button>
            </form>
        </div>
    );
}
