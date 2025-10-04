"use client"

type Props = {
  onClose: () => void
}

export default function TermsModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-md text-center animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Terms & Policy</h2>
        <p className="text-sm text-gray-600 mb-6">
          Example terms and conditions go here...  
          You must accept before registering.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 rounded-full text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
