import { useLocation, useNavigate } from "react-router-dom";

export default function Success() {
  const loc = useLocation();
  const navigate = useNavigate();
  const state = (loc.state || {}) as any;

  return (
    <div className="h-screen bg-[#00C317] flex items-center justify-center">
      <div className="text-center p-6">
        <img src="/success-icon.png" alt="success" className="mx-auto mb-4" />
        <h2 className="text-white text-2xl mb-2">
          {state?.message || "Success"}
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 bg-white text-green-600 px-6 py-3 rounded-full"
        >
          Go back to Dashboard
        </button>
      </div>
    </div>
  );
}
