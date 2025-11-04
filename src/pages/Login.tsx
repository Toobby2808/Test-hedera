import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useHashConnect from "../hook/useHashConnect";
import { useAuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const {
    connect,
    isConnected,
    accountId,
    isLoading: isWalletLoading /* pairingData */,
  } = useHashConnect();
  const { setUser, setToken /*  logout */ } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginForm = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("https://team-7-api.onrender.com/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Login failed");

      const token = data.token || data.access_token;
      if (!token) throw new Error("No token from server");
      setToken(token);
      localStorage.setItem("authToken", token);

      // fetch and store profile
      const profileRes = await fetch(
        "https://team-7-api.onrender.com/profile/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const profile = await profileRes.json();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Hedera login: connect to wallet and call backend /connect-hedera or /login-hedera
  const handleHederaSignIn = async () => {
    setError("");
    try {
      if (!isConnected) {
        await connect();
        return; // waiting for pairing -> pairingEvent will run later; we also run effect below
      }
      if (isConnected && accountId) {
        await loginWithHedera(accountId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hedera login failed");
    }
  };

  const loginWithHedera = async (hederaAccountId: string) => {
    setIsLoading(true);
    try {
      // call your backend login endpoint
      const res = await fetch("https://team-7-api.onrender.com/login-hedera/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hedera_account_id: hederaAccountId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Hedera login failed");

      if (data.token) {
        setToken(data.token);
        localStorage.setItem("authToken", data.token);
      }
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hedera login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // If user returned from mobile deep link and pairingEvent fired, login automatically
  useEffect(() => {
    if (isConnected && accountId) {
      console.log("Auto-login with Hedera account", accountId);
      loginWithHedera(accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, accountId]);

  return (
    <div className=" h-screen w-full flex flex-col justify-center items-center bg-white ">
      <div className="max-w-[700px] w-full mx-auto  shadow-md flex flex-col items-center  p-8 bg-white rounded-lg">
        <h2 className="text-green-600 text-3xl font-bold mb-8">Login</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLoginForm();
          }}
          className="flex flex-col gap-3 w-full"
        >
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
          {error && <div style={{ color: "red" }}>{error}</div>}
          <button
            disabled={isLoading}
            className="bg-green-500 text-white w-full rounded-full py-2.5 px-4 font-semibold transition hover:bg-green-700 cursor-pointer"
          >
            {isLoading ? "Logging..." : "Login"}
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
            ? `Connected: ${accountId?.slice(0, 6)}...`
            : "Continue with Hedera"}
        </button>
      </div>
    </div>
  );
}
