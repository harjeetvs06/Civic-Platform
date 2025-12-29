"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logout, getUserRole } from "../auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        const role = await getUserRole(u.uid);
        setUserRole(role);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const dref = doc(db, "users", user.uid);
        const snap = await getDoc(dref);
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      }
    };
    load();
  }, [user]);

  async function saveDetails(e) {
    e && e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          email: user.email,
          role: userRole,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Save error", err);
      setMessage("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Profile</h1>

          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={userRole || "citizen"}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-50 capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={saveDetails}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

