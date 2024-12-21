// import { Navbar } from "./Navbar";
// import { Outlet, useNavigate } from "react-router-dom";
// import { Fragment, useEffect, useState } from "react";
// import { StudentSidebar } from './StudentSidebar';
// import { Sidebar } from './Sidebar';
// import * as jwt_decode from "jwt-decode";

// export function Layout() {
//     const navigate = useNavigate();
//     const [role, setRole] = useState(null);
//     let user = sessionStorage.getItem("user");

//     useEffect(() => {
//         if (!user) {
//             navigate("/");
//         } else {
//             const decodedUser = jwt_decode.jwtDecode(user);
//             setRole(decodedUser.role); // Assuming the user object contains a "role" field
//         }
//     }, [user, navigate]);

//     return (
//         <Fragment>
//             {/* Navbar */}
//             <div className="flex w-full bg-white shadow-sm h-16 md:fixed top-0 fixed">
//                 <Navbar />
//             </div>
            
//             {/* Layout */}
//             <div className="flex flex-col md:flex-row max-w-[1440px] py-5 px-5 md:px-[50px] lg:px-[150px] gap-5 mt-16">
//                 {/* Conditionally render the sidebar based on the user role */}
//                 {role === "tutor" && (
//                     <div className="hidden md:block fixed">
//                         <Sidebar />
//                     </div>
//                 )}
//                 {role === "student" && (
//                     <div className="hidden md:block fixed">
//                         <StudentSidebar />
//                     </div>
//                 )}
                
//                 {/* Main Content Area with Infinite Scroll */}
//                 <div 
//                     className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth focus:scroll-auto scrollbar-hidden md:ml-[250px]"
//                 >
//                     <Outlet /> {/* Main content area */}
//                 </div>
//             </div>
//         </Fragment>
//     );
// }


import { Navbar } from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { StudentSidebar } from './StudentSidebar';
import { Sidebar } from './Sidebar';
import * as jwt_decode from "jwt-decode";
import { useTheme } from "./ThemeContext";

export function Layout() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [role, setRole] = useState(null);
    let user = sessionStorage.getItem("user");

    useEffect(() => {
        if (!user) {
            navigate("/");
        } else {
            const decodedUser = jwt_decode.jwtDecode(user);
            setRole(decodedUser.role); // Assuming the user object contains a "role" field
        }
    }, [user, navigate]);

    return (
        <Fragment>
            <div className={`app-container ${theme}`}> {/* Apply theme class */}
                {/* Navbar */}
                <div className="flex w-full shadow-sm h-16 bg-white dark:bg-gray-800 md:fixed top-0 fixed">
                    <Navbar />
                </div>
                
                {/* Layout */}
                <div className="flex flex-col md:flex-row max-w-[1440px] py-5 px-5 md:px-[50px] lg:px-[150px] gap-5 mt-16">
                    {/* Conditionally render the sidebar based on the user role */}
                    {role === "tutor" && (
                        <div className="hidden md:block fixed">
                            <Sidebar />
                        </div>
                    )}
                    {role === "student" && (
                        <div className="hidden md:block fixed">
                            <StudentSidebar />
                        </div>
                    )}
                    
                    {/* Main Content Area with Infinite Scroll */}
                    <div 
                        className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth focus:scroll-auto scrollbar-hidden md:ml-[250px] bg-gray-100 dark:bg-gray-900"
                    >
                        <Outlet /> {/* Main content area */}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
