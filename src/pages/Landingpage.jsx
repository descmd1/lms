import { CreateUser } from "../components/CreateUser";
import { Login } from "../components/Login";
import { useState } from "react";

export function Landingpage() {
  // view == 0 ---> login
  // view == 1 ---> create user
  const [view, setView] = useState(0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-24 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md mx-auto">
        {!view ? (
          <>
            <Login />
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm sm:text-base mb-2">Don't have an account?</p>
              <button
                className="text-blue-500 font-medium hover:text-blue-600 transition-colors duration-200 text-sm sm:text-base"
                onClick={() => setView(1)}
              >
                Create Account
              </button>
            </div>
          </>
        ) : (
          <>
            <CreateUser setView={setView} view={view} />
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm sm:text-base mb-2">Already have an account?</p>
              <button
                className="text-blue-500 font-medium hover:text-blue-600 transition-colors duration-200 text-sm sm:text-base"
                onClick={() => setView(0)}
              >
                Login existing account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
