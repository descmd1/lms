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
            setRole(decodedUser.role); 
        }
    }, [user, navigate]);

    return (
        <Fragment>
            <div className={`layout-container ${theme}`}> 
                <div className="flex w-full shadow-sm h-16 md:fixed top-0 fixed z-50">
                    <Navbar />
                </div>
                <div className="flex flex-col md:flex-row w-full py-2 sm:py-4 md:py-5 px-2 sm:px-4 md:px-[50px] lg:px-[150px] gap-2 sm:gap-4 md:gap-5 mt-16">
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
                    <div 
                        className="flex-1 w-full min-h-screen overflow-y-auto scroll-smooth focus:scroll-auto scrollbar-hidden md:ml-[250px]"
                    >
                        <Outlet /> 
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
