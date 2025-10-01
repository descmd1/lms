import { verifyUser } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; 

export function Login() {
    const [user, setUser] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();

    function handleChange(e) {
        setUser({ ...user, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        let response = await verifyUser(user);
        if (response) {
            sessionStorage.setItem("user", response);
            axios.defaults.headers.common["Authorization"] = `Bearer ${response}`; 
            navigate("/home");
        } else {
            window.alert("Login failed");
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col py-4 px-4 sm:py-6 sm:px-6 rounded-lg shadow-lg bg-white w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
        >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
            <input
                name="email"
                placeholder="e.g example@email.com"
                onChange={handleChange}
                maxLength={30}
                className="py-3 px-4 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            />
            <div className="relative">
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    onChange={handleChange}
                    maxLength={20}
                    className="py-3 px-4 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full text-sm sm:text-base transition-all duration-200"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 vertical-center"
                >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
            </div>
            <button
                type="submit"
                className="py-3 px-4 mb-4 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
            >
                Login
            </button>
        </form>
    );
}
