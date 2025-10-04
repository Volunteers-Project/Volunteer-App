"use client"

import { useState, useEffect } from "react"
import AuthTabs from "./components/AuthTabs"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import TermsModal from "./components/TermsModal"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPolicy, setShowPolicy] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={`flex min-h-screen ${
        isLandscape ? "flex-row bg-white" : "flex-col bg-white"
      } text-black`}
    >
      {/* Branding panel in landscape */}
      {isLandscape && (
        <div className="flex-1 flex items-center justify-center bg-black text-white p-6">
          <h1 className="text-3xl font-bold">Volunteer App</h1>
        </div>
      )}

      {/* Auth box */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md w-full max-w-md border border-gray-200 flex flex-col justify-between p-8 min-h-[500px]">
          {/* Top (Tabs) */}
          <div className="flex justify-center mb-6">
            <AuthTabs mode={mode} setMode={setMode} />
          </div>

          {/* Middle (Forms) expands with screen */}
          <div className="flex-1 flex items-center">
            {mode === "login" ? (
              <LoginForm />
            ) : (
              <RegisterForm onOpenPolicy={() => setShowPolicy(true)} />
            )}
          </div>

          {/* Bottom spacing stays proportional because of flex */}
        </div>
      </div>

      {showPolicy && <TermsModal onClose={() => setShowPolicy(false)} />}
    </div>
  )
}
