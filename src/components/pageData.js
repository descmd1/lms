import { BsPeople } from "react-icons/bs";
import { CgMail } from "react-icons/cg";
import { CiSettings } from "react-icons/ci"
import { FaBook, FaHome, FaUser, FaWaveSquare } from "react-icons/fa"
import { PiBookOpenTextLight } from "react-icons/pi";


export const pageData = [
    {
        name: "Home",
        path: "/home",
        icon: <FaHome size={16}/>
    },
    {
        name: "About Us",
        path: "/about",
        icon: <BsPeople size={16}/>
    },
    {
        name: "Contact",
        path: "/contact",
        icon: <CgMail size={16}/>
    },
];

export const sidebarData = [
    {
        name: "Analytics",
        path: "/analytics",
        icon: <FaWaveSquare size={24}/>
    }, 
    {
        name: "Resources",
        path: "/resources",
        icon: <PiBookOpenTextLight size={24}/>
    }, 
    {
        name: "Settings",
        path: "/settings",
        icon: <CiSettings size={24}/>
    }, 
];

export const dashboardData = [
    {
        name: "Dashboard",
        path: "/home",
        icon: <FaHome size={24}/>
    },
];

export const managecourseData = [
    {
        name: "Manage Course",
        path: null, // No direct path, as it's a parent
        icon: <FaBook size={24} />,
        subItems: [
            {
                name: "Create Course",
                path: "/createcourse",
                icon: <PiBookOpenTextLight size={24}/>
            },
        ]
    }
];
export const getProfileData = (user) => ({
    name: "Profile",
    path: "/profile",
    icon: <FaUser size={18} color="grey" />,  // Default icon if no image
    profileImage: user?.profileImage || null,  // Set profileImage if available
});


export const studentCourseData = [
    {
        name: "Dashboard",
        path: "/home",
        icon: <FaHome size={24}/>
    },
    
            {
                name: "Courses",
                path: "/home",
                icon: <PiBookOpenTextLight size={24}/>
            },
            {
                name: "Enrolled Courses",
                path: "/enrolled",
                icon: <PiBookOpenTextLight size={24}/>
            },
            {
                name: "Ongoing Courses",
                path: "/ongoing-courses",
                icon: <PiBookOpenTextLight size={24}/>
            },
            {
                name: "Finished Courses",
                path: "/completed-courses",
                icon: <PiBookOpenTextLight size={24}/>
            },
            {
                name: "Resources",
                path: "/view-resources",
                icon: <PiBookOpenTextLight size={24}/>
            }, 
            {
                name: "Settings",
                path: "/settings",
                icon: <CiSettings size={24}/>
            }, 
];



