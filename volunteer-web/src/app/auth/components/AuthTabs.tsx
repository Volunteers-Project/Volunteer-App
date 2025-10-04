"use client"

type Props = {
  mode: "login" | "register"
  setMode: (m: "login" | "register") => void
}

export default function AuthTabs({ mode, setMode }: Props) {
  return (
    <div className="relative flex bg-gray-300 rounded-full mb-8 w-2/3 mx-auto h-10">
      <button
        onClick={() => setMode("login")}
        className={`flex-1 text-sm z-10 rounded-full transition ${
          mode === "login" ? "text-white" : "text-gray-600"
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setMode("register")}
        className={`flex-1 text-sm z-10 rounded-full transition ${
          mode === "register" ? "text-white" : "text-gray-600"
        }`}
      >
        Register
      </button>
      <div
        className={`absolute top-0 bottom-0 w-1/2 bg-black rounded-full transition-transform duration-300`}
        style={{
          transform: mode === "login" ? "translateX(0%)" : "translateX(100%)",
        }}
      />
    </div>
  )
}
