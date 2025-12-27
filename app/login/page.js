"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, createAccount, resetEmail } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createAccount(email, password, role, name);
      router.push("/");
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(null);
    try {
      await resetEmail(email);
      setError("Password reset email sent if the account exists.");
    } catch (err) {
      setError(err.message || "Reset failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          CivicGrievance
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Public Issue Reporting Platform
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded ${
              !isSignUp
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded ${
              isSignUp
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form
          onSubmit={isSignUp ? handleSignUp : handleLogin}
          className="flex flex-col gap-4"
        >
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignUp && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="citizen">Citizen</option>
              <option value="municipality">Municipality Authority</option>
              <option value="thinktank">Think Tank / Policy Agency</option>
            </select>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? isSignUp
                ? "Creating Account..."
                : "Signing in..."
              : isSignUp
              ? "Sign Up"
              : "Login"}
          </button>

          {!isSignUp && (
            <button
              type="button"
              onClick={handleReset}
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot Password?
            </button>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

