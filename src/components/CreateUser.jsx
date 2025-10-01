import { createUser } from "../api";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; 
import Swal from "sweetalert2";

export function CreateUser({ setView, view }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default role
  });
  const [showPassword, setShowPassword] = useState(false); 

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let response = await createUser(user);
    if (response.status === 200) {
      // Redirect to login after successful signup
      setView(0);
    } else {
      Swal.fire({
  title: 'Error!',
  text: 'User accound could not be created!',
  icon: 'error',
  confirmButtonText: 'OK'
})
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col py-4 px-4 sm:py-6 sm:px-6 rounded-lg shadow-lg bg-white w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>
      <input
        className="py-3 px-4 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base transition-all duration-200"
        name="name"
        placeholder="Enter your name"
        onChange={handleChange}
        maxLength={20}
        required
      />
      <input
        className="py-3 px-4 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base transition-all duration-200"
        name="email"
        placeholder="e.g example@email.com"
        onChange={handleChange}
        maxLength={30}
        required
      />
      <div className="relative">
        <input
          className="py-3 px-4 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full text-sm sm:text-base transition-all duration-200"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={handleChange}
          maxLength={20}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
        </button>
      </div>
      <select
        className="py-3 px-4 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base transition-all duration-200 bg-white"
        name="role"
        value={user.role}
        onChange={handleChange}
        required
      >
        <option value="student">Student</option>
        <option value="tutor">Tutor</option>
      </select>
      <button
        className="py-3 px-4 mb-4 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
        type="submit"
      >
        Create account
      </button>
    </form>
  );
}
