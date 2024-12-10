import { createUser } from "../api";
import { useState } from "react";

export function CreateUser({ setView, view }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default role
  });

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
      window.alert("User account could not be created!");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col py-3 px-4 rounded-md shadow-sm bg-white md:w-4/12 md:p-4 w-full"
    >
      <input
        className="py-2 px-3 mb-4 rounded-sm border"
        name="name"
        placeholder="Enter your name"
        onChange={handleChange}
        maxLength={20}
        required
      />
      <input
        className="py-2 px-3 mb-4 rounded-sm border"
        name="email"
        placeholder="e.g example@email.com"
        onChange={handleChange}
        maxLength={30}
        required
      />
      <input
        className="py-2 px-3 mb-4 rounded-sm border"
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        maxLength={20}
        required
      />
      {/* Add a dropdown for selecting the role */}
      <select
        className="py-2 px-3 mb-4 rounded-sm border"
        name="role"
        value={user.role}
        onChange={handleChange}
        required
      >
        <option value="student">Student</option>
        <option value="tutor">Tutor</option>
      </select>
      <button
        className="py-2 px-3 mb-4 rounded-sm bg-blue-400 text-white"
        type="submit"
      >
        Create account
      </button>
    </form>
  );
}

