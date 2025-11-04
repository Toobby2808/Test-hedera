// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useHashConnect from "../hook/useHashConnect";
import { useAuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const {
    connect,
    isConnected,
    accountId,
    isLoading: isWalletLoading,
  } = useHashConnect();
  const { setUser } = useAuthContext();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!username.trim()) return "Please enter username";
    if (!email.trim()) return "Please enter email";
    if (!password || password.length < 8)
      return "Password must be at least 8 chars";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!agreedToTerms) return "Accept terms";
    return null;
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    const v = validateForm();
    if (v) return setError(v);

    setIsLoading(true);
    try {
      // call your API
      const res = await fetch("https://team-7-api.onrender.com/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: email.toLowerCase(),
          password,
          role: "student",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Register failed");

      // normalize user object
      const userData = data.user || {
        id: data.id || Date.now(),
        username: username,
        email,
      };

      // save user + token if provided
      if (data.token) localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // navigate to success screen or dashboard
      navigate("/success", {
        state: { message: "Account created", user: userData },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Hedera flow: connect first, then call backend connect-hedera
  const handleHederaSignIn = async () => {
    setError("");
    try {
      if (!isConnected) {
        await connect(); // opens wallet/pairing
        return; // pairingEvent will update accountId; effect below will handle backend save
      }
      if (isConnected && accountId) {
        await saveHederaAccountToAPI(accountId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hedera connect failed");
    }
  };

  const saveHederaAccountToAPI = async (hederaAccountId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "https://team-7-api.onrender.com/connect-hedera/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hedera_account_id: hederaAccountId }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Failed to save Hedera account");

      // if your backend returns user and token, save them
      if (data.token) localStorage.setItem("authToken", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      navigate("/success", {
        state: { message: "Hedera connected", user: data.user || null },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save Hedera account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If pairing completed and accountId now available, automatically call backend (so mobile deep-link return works)
  useEffect(() => {
    if (isConnected && accountId) {
      // do not automatically attach Hedera for general register; only if user pressed Hedera button you may want to call backend
      // optional: call saveHederaAccountToAPI(accountId);
      console.log("Hash wallet connected (register page):", accountId);
    }
  }, [isConnected, accountId]);

  return (
    <div className=" h-screen w-full flex flex-col justify-center items-center bg-white ">
      {/* Simplified UI — integrate with your existing form layout */}
      <div className="max-w-[700px] w-full mx-auto  shadow-md flex flex-col items-center  p-8 bg-white rounded-lg">
        <h2 className="text-green-600 text-3xl font-bold mb-8">Register</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-3 w-full">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="border rounded-md w-full p-3 border-green-300 outline-none focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border rounded-md w-full p-3 border-green-300 outline-none focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border rounded-md w-full p-3 border-green-300 outline-none focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="border rounded-md w-full p-3 border-green-300 outline-none focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
          <label>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="accent-green-500"
            />
            <span className="ml-2">I agree</span>
          </label>

          {error && <div style={{ color: "red" }}>{error}</div>}
          <button
            disabled={isLoading}
            className="bg-green-500 text-white w-full rounded-full py-2.5 px-4 font-semibold transition hover:bg-green-700 cursor-pointer"
          >
            {isLoading ? "Creating..." : "Confirm"}
          </button>
        </form>

        <button
          onClick={handleHederaSignIn}
          disabled={isWalletLoading || isLoading}
          className="bg-black mt-6 text-white w-full rounded-full py-2.5 px-4 font-semibold transition  cursor-pointer"
        >
          {isWalletLoading
            ? "Connecting..."
            : isConnected
            ? ` Connected ${accountId?.slice(0, 6)}...`
            : "Continue with Hedera"}
        </button>
      </div>
    </div>
  );
}
