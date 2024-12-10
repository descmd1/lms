import { Navbar } from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { StudentSidebar } from './StudentSidebar';
import { Sidebar } from './Sidebar';
import * as jwt_decode from "jwt-decode";

export function Layout() {
    const navigate = useNavigate();
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
            <div className="flex w-full bg-white shadow-sm h-16 md:fixed top-0 fixed">
                <Navbar />
            </div>
            <div className="flex flex-col md:flex-row max-w-[1440px] py-5 px-5 md:px-[50px] lg:px-[150px] gap-5 mt-16">
                {/* Conditionally render the sidebar based on the user role */}
                {role === "tutor" && <Sidebar />}
                {role === "student" && <StudentSidebar/>}
                <div className="flex-1 w-full scroll-smooth focus:scroll-auto">
                    <Outlet /> {/* Main content area */}
                </div>
            </div>
        </Fragment>
    );
 }

