import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateCourse, getCourse } from "../api";
import { useTheme } from "../components/ThemeContext";

export function EditCourse() {
    const { id } = useParams(); 
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
        chapters: [], 
    });

    const [isLoading, setIsLoading] = useState(true); 

    // Fetch course data when component mounts
    useEffect(() => {
        async function loadCourse() {
            try {
                const data = await getCourse(id);  
                setCourseData(data);  
                setIsLoading(false);  
            } catch (error) {
                console.error("Error fetching course:", error);
                setIsLoading(false);  
            }
        }
        loadCourse();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setCourseData((prevData) => ({
            ...prevData,
            [name]: files[0], 
        }));
    };

    const handleChapterChange = (index, e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => {
            const chapters = [...prevData.chapters];
            chapters[index] = { ...chapters[index], [name]: value }; 
            return { ...prevData, chapters };
        });
    };

    const handleChapterFileChange = (index, e) => {
        const { name, files } = e.target;
        setCourseData((prevData) => {
            const chapters = [...prevData.chapters];
            chapters[index] = { ...chapters[index], [name]: files[0] }; 
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
                        formData.append(`chapters[${index}][video]`, chapter.video); 
                    }
                    formData.append(`chapters[${index}][title]`, chapter.title); 
                });
            } else if (courseData[key] !== null && courseData[key] !== undefined) {
                formData.append(key, courseData[key]);  
            }
        });

        try {
            await updateCourse(id, formData);  
            navigate("/home");  
        } catch (error) {
            console.error("Error updating course:", error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`app-container ${theme} flex justify-center items-center px-4 py-4 
        rounded-md shadow-2xl`}>
            <form onSubmit={handleSubmit} className="flex flex-col w-full shadow-sm">
                <input
                    name="title"
                    placeholder="Title"
                    maxLength={100}
                    value={courseData.title}  
                    onChange={handleInputChange}
                    required
                    className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm border color bg-transparent`}
                />
                <input
                    name="description"
                    placeholder="Description"
                    maxLength={300}
                    value={courseData.description}  
                    onChange={handleInputChange}
                    required
                    className={`field-color ${theme} py-3 px-3 mb-4 rounded-sm border color bg-transparent`}
                />
                <textarea
                    name="content"
                    placeholder="Write your content"
                    maxLength={3000}
                    value={courseData.content}  
                    onChange={handleInputChange}
                    required
                    className={`field-color ${theme} py-5 px-4 mb-4 rounded-sm border color bg-transparent`}
                />
                {/* Category selection */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-gray-400 font-normal">Select Category</label>
                    <select
                        name="category"
                        value={courseData.category}  
                        onChange={handleInputChange}
                        required
                        className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm border color bg-transparent`}
                    >
                        <option value="" className={`layout-container ${theme}`} >Select a category</option>
                        <option value="programming" className={`layout-container ${theme}`}>Programming</option>
                        <option value="design" className={`layout-container ${theme}`}>Design</option>
                        <option value="marketing" className={`layout-container ${theme}`}>Marketing</option>
                        <option value="business" className={`layout-container ${theme}`}>Business</option>
                    </select>
                </div>

                {/* Chapters Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Chapters</h3>
                    {courseData.chapters.map((chapter, index) => (
                        <div key={index} className="p-3 rounded">
                            <input
                                name="title"
                                placeholder="Chapter Title"
                                value={chapter.title}  
                                onChange={(e) => handleChapterChange(index, e)}
                                required
                                className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm border color w-full bg-transparent`}
                            />
                            <input
                                type="file"
                                name="video"
                                accept="video/*"
                                onChange={(e) => handleChapterFileChange(index, e)}  
                                className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm border color w-full bg-transparent`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-5 w-full">
                    <input
                        name="price"
                        placeholder="Price"
                        value={courseData.price}  
                        onChange={handleInputChange}
                        required
                        className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm border color bg-transparent`}
                    />
                    <input
                        name="duration"
                        placeholder="Duration"
                        value={courseData.duration} 
                        onChange={handleInputChange}
                        required
                        className={`field-color ${theme} py-2 px-3 mb-4 rounded-sm border color bg-transparent`}
                    />
                </div>
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        checked={courseData.published}  
                        onChange={(e) => setCourseData({ ...courseData, published: e.target.checked })}
                    />
                    <label className="ml-2">Publish this course</label>
                </div>
                <button type="submit" className={`button-color card-hover ${theme} transition-colors duration-700 p-3 bg-blue-400 text-white`}>Update Course</button>
            </form>
        </div>
    );
}
