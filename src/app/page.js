import Link from "next/link";

// Questa è una Server Component di default
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">
          Welcome to <span className="text-indigo-600">MyGym</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          The all-in-one platform for gyms and their members.
        </p>

        <div className="mt-8 space-x-4">
          <Link
            href="/login"
            className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Log In
          </Link>
          <Link
            href="/gym/register-gym"
            className="px-6 py-3 font-semibold text-indigo-700 bg-white border border-indigo-600 rounded-md hover:bg-gray-50"
          >
            Register Your Gym
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-0 py-4 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} MyGym. All rights reserved.</p>
      </footer>
    </div>
  );
}
