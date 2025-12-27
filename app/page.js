"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
} from "firebase/firestore";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import Navbar from "./components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!db) return;

    let q = query(collection(db, "issues"));

    // Apply filters
    if (filterCategory !== "all") {
      q = query(q, where("category", "==", filterCategory));
    }
    if (filterStatus !== "all") {
      q = query(q, where("status", "==", filterStatus));
    }

    // Apply sorting
    if (sortBy === "newest") {
      q = query(q, orderBy("createdAt", "desc"));
    } else if (sortBy === "trending") {
      q = query(q, orderBy("upvotes", "desc"));
    } else if (sortBy === "oldest") {
      q = query(q, orderBy("createdAt", "asc"));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Client-side location filter
      let filtered = items;
      if (filterLocation) {
        filtered = items.filter((item) =>
          item.location?.toLowerCase().includes(filterLocation.toLowerCase())
        );
      }

      setIssues(filtered);
    });

    return () => unsub();
  }, [filterCategory, filterStatus, filterLocation, sortBy]);

  async function handleUpvote(issueId, currentUpvotes, upvotedBy) {
    if (!user) {
      router.push("/login");
      return;
    }

    const isUpvoted = upvotedBy?.includes(user.uid);
    const issueRef = doc(db, "issues", issueId);

    try {
      if (isUpvoted) {
        await updateDoc(issueRef, {
          upvotes: currentUpvotes - 1,
          upvotedBy: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(issueRef, {
          upvotes: currentUpvotes + 1,
          upvotedBy: arrayUnion(user.uid),
        });
      }
    } catch (err) {
      console.error("Upvote error:", err);
      alert("Failed to upvote: " + err.message);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  function getStatusColor(status) {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "unresolved":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Civic Issue Feed
            </h1>
            <p className="text-gray-600">
              Report, track, and resolve civic issues in your community
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="all">All Categories</option>
                  <option value="roads">Roads</option>
                  <option value="water">Water Supply</option>
                  <option value="waste">Waste Management</option>
                  <option value="electricity">Electricity</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="unresolved">Unresolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Search location..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="newest">Newest First</option>
                  <option value="trending">Most Upvoted</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issues Feed */}
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                No issues found. Be the first to{" "}
                <button
                  onClick={() => router.push("/post-issue")}
                  className="text-blue-600 hover:underline"
                >
                  report an issue
                </button>
                !
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {issue.title}
                        </h2>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {issue.status?.replace("_", " ").toUpperCase() ||
                            "OPEN"}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{issue.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📍 {issue.location || "Location not set"}</span>
                        <span>🏷️ {issue.category || "Uncategorized"}</span>
                        <span>🏛️ {issue.taggedAuthority || "Not tagged"}</span>
                        <span>📅 {formatDate(issue.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 ml-4">
                      <button
                        onClick={() =>
                          handleUpvote(
                            issue.id,
                            issue.upvotes || 0,
                            issue.upvotedBy || []
                          )
                        }
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          issue.upvotedBy?.includes(user?.uid)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        disabled={!user}
                      >
                        👍 {issue.upvotes || 0}
                      </button>
                    </div>
                  </div>

                  {issue.mediaURLs && issue.mediaURLs.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {issue.mediaURLs.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Issue evidence ${idx + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {issue.response && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Official Response:
                      </h3>
                      <p className="text-blue-800">{issue.response.text}</p>
                      {issue.response.proofURLs &&
                        issue.response.proofURLs.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {issue.response.proofURLs.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Proof ${idx + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

