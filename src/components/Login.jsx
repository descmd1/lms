// import { verifyUser } from "../api";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from 'axios'

// export function Login() {
//     const [user, setUser] = useState({
//         email:"",
//         passward:""
//     })
//     const navigate = useNavigate()


// function handleChange(e){
//     setUser({...user, [e.target.name]: e.target.value})
// }

// async function handleSubmit (e){
//     e.preventDefault()
// let response = await verifyUser(user)
// if(response){
//     sessionStorage.setItem("user", response)
//     axios.defaults.headers.common["Authorization"] = `Bearer ${response}` //you can use token intead of response
//     navigate("/home")
// }else{
//     window.alert("Login failed")
// }
// }
//     return(
//         <form onSubmit={handleSubmit} className="flex flex-col py-3 px-4 rounded-md shadow-sm bg-white md:w-4/12 md:p-4 w-full">
//             <input 
//             name="email" 
//             placeholder="e.g example@email.com" 
//             onChange={handleChange} 
//             maxLength={30}
//             className="py-2 px-3 mb-4 rounded-sm border"
//             />
//             <input 
//             name="password" 
//             type="password" 
//             placeholder="password"
//             onChange={handleChange} 
//             maxLength={20}
//             className="py-2 px-3 mb-4 rounded-sm border"
//             />
//             <button type="submit" 
//             className="py-2 px-3 mb-4 rounded-sm bg-blue-400 text-white">
//                 Login
//             </button>
//         </form>
//     )
// }

import { verifyUser } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Icons for eye and eye-slash

export function Login() {
    const [user, setUser] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const navigate = useNavigate();

    function handleChange(e) {
        setUser({ ...user, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        let response = await verifyUser(user);
        if (response) {
            sessionStorage.setItem("user", response);
            axios.defaults.headers.common["Authorization"] = `Bearer ${response}`; //you can use token instead of response
            navigate("/home");
        } else {
            window.alert("Login failed");
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col py-3 px-4 rounded-md shadow-sm bg-white md:w-4/12 md:p-4 w-full"
        >
            <input
                name="email"
                placeholder="e.g example@email.com"
                onChange={handleChange}
                maxLength={30}
                className="py-2 px-3 mb-4 rounded-sm border"
            />
            <div className="relative">
                <input
                    name="password"
                    type={showPassword ? "text" : "password"} // Toggle between text and password
                    placeholder="password"
                    onChange={handleChange}
                    maxLength={20}
                    className="py-2 px-3 mb-4 rounded-sm border w-full"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
            </div>
            <button
                type="submit"
                className="py-2 px-3 mb-4 rounded-sm bg-blue-400 text-white"
            >
                Login
            </button>
        </form>
    );
}
