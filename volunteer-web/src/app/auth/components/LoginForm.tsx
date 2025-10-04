"use client"

import { useState } from "react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-full transition text-sm"
      >
        Login
      </button>
    </form>
  )
}
