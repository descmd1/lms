import { CreateUser } from "../components/CreateUser";
import { Login } from "../components/Login";
import { useState } from "react";

export function Landingpage() {
  // view == 0 ---> login
  // view == 1 ---> create user
  const [view, setView] = useState(0);

  return (
    <div className="md:w-full flex flex-col items-center justify-center py-24 px-4">
      {!view ? (
        <>
          <Login />
          <button
            className="text-blue-400 font-normal mt-4"
            onClick={() => setView(1)}
          >
            Create Account
          </button>
        </>
      ) : (
        <>
          <CreateUser setView={setView} view={view} />
          <button
            className="text-blue-400 font-normal mt-4"
            onClick={() => setView(0)}
          >
            Login existing account
          </button>
        </>
      )}
    </div>
  );
}
