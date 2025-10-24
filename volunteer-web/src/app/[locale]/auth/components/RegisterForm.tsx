"use client"

import { useState } from "react"

type Props = {
  onOpenPolicy: () => void
}

export default function RegisterForm({ onOpenPolicy }: Props) {
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "", agree: false })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  function validateField(field: string, value: string) {
    let msg = ""

    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      msg = "Invalid email format"
    }

    if (field === "username" && value.trim().length < 3) {
      msg = "Username must be ≥ 3 characters"
    }

    if (field === "password" && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)) {
      msg = "Password must be ≥ 8 chars, with upper, lower, number, and special char"
    }

    if (field === "confirm" && value !== form.password) {
      msg = "Passwords do not match"
    }

    setErrors((prev) => ({ ...prev, [field]: msg }))
  }

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (typeof value === "string") {
      validateField(field, value)
    }
    // ✅ checkbox handled only on submit
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  // Final validation
  const newErrors: { [key: string]: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format"
    if (form.username.trim().length < 3) newErrors.username = "Username must be ≥ 3 characters"
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password))
      newErrors.password = "Password must be ≥ 8 chars, with upper, lower, number, and special char"
    if (form.password !== form.confirm) newErrors.confirm = "Passwords do not match"
    if (!form.agree) newErrors.agree = "You must agree before registering"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Call API
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          username: form.username,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrors({ general: data.error || "Registration failed" })
        return
      }

      alert("✅ Registration successful! Please check your email to verify your account.")
      setForm({ email: "", username: "", password: "", confirm: "", agree: false })
    } catch (err) {
      console.error(err)
      setErrors({ general: "Unexpected error occurred" })
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-4/5 mx-auto">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
            focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
            focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
            focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          value={form.confirm}
          onChange={(e) => handleChange("confirm", e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
            focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
        {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
      </div>

      {/* Terms */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => handleChange("agree", e.target.checked)}
          className="w-4 h-4 mr-2"
        />
        <label className="text-sm">I agree to the </label>
        <span
          className="text-sm underline cursor-pointer"
          onClick={onOpenPolicy}
        >
          Terms & Policy
        </span>
      </div>
      {errors.agree && <p className="text-red-500 text-sm">{errors.agree}</p>}

      {/* Register button */}
      <div className="w-2/3 mx-auto">
        <button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-full transition text-sm"
        >
          Register
        </button>
      </div>
    </form>
  )
}
