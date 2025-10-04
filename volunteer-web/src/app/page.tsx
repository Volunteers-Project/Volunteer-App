"use client"

import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Welcome to Volunteer App
        </h1>
        <p className="text-gray-600 mb-6">
          Join us and start making an impact today!
        </p>

        <button
          onClick={() => router.push("/auth")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all"
        >
          Go to Register
        </button>
      </div>
    </div>
  )
}
