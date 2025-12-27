"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logout, getUserRole } from "../auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const role = await getUserRole(u.uid);
        setUserRole(role);
        
        // Get user name
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || u.email?.split("@")[0] || "User");
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setUserRole(null);
        setUserName("");
      }
    });
    return () => unsub();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  }

  if (pathname === "/login") return null;

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/")}
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              CivicGrievance
            </button>
            {user && (
              <>
                <button
                  onClick={() => router.push("/")}
                  className={`px-3 py-2 rounded ${
                    pathname === "/"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Home Feed
                </button>
                <button
                  onClick={() => router.push("/post-issue")}
                  className={`px-3 py-2 rounded ${
                    pathname === "/post-issue"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Report Issue
                </button>
                {userRole === "municipality" && (
                  <button
                    onClick={() => router.push("/municipality-dashboard")}
                    className={`px-3 py-2 rounded ${
                      pathname === "/municipality-dashboard"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Dashboard
                  </button>
                )}
                {userRole === "thinktank" && (
                  <button
                    onClick={() => router.push("/analytics")}
                    className={`px-3 py-2 rounded ${
                      pathname === "/analytics"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Analytics
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {userName} ({userRole})
                </span>
                <button
                  onClick={() => router.push("/profile")}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

