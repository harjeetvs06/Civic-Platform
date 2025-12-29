"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "../auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../components/Navbar";

export default function MunicipalityDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [responseType, setResponseType] = useState("resolved");
  const [responseText, setResponseText] = useState("");
  const [responseFiles, setResponseFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        const role = await getUserRole(u.uid);
        setUserRole(role);
        if (role !== "municipality") {
          router.push("/");
        }
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!db || !user) return;

    let q = query(collection(db, "issues"));
    
    if (filterStatus !== "all") {
      q = query(q, where("status", "==", filterStatus));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(items);
    });

    return () => unsub();
  }, [user, filterStatus]);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    setResponseFiles([...responseFiles, ...files]);
  }

  function removeFile(index) {
    setResponseFiles(responseFiles.filter((_, i) => i !== index));
  }

  async function uploadFiles() {
    const urls = [];
    for (const file of responseFiles) {
      const storageRef = ref(
        storage,
        `responses/${selectedIssue.id}/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  }

  async function handleSubmitResponse() {
    if (!selectedIssue || !responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    setSaving(true);
    try {
      let proofURLs = [];
      if (responseFiles.length > 0) {
        proofURLs = await uploadFiles();
      }

      const responseData = {
        type: responseType,
        text: responseText.trim(),
        proofURLs,
        respondedBy: user.uid,
        respondedByEmail: user.email,
        respondedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "issues", selectedIssue.id), {
        status: responseType === "resolved" ? "resolved" : "in_progress",
        response: responseData,
        updatedAt: new Date().toISOString(),
      });

      alert("Response submitted successfully!");
      setSelectedIssue(null);
      setResponseText("");
      setResponseFiles([]);
      setResponseType("resolved");
    } catch (err) {
      console.error("Submit response error:", err);
      alert("Failed to submit response: " + err.message);
    } finally {
      setSaving(false);
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
        return "bg-blue-100 text-blue-800";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Municipality Dashboard
          </h1>

          <div className="mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Issues</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="unresolved">Unresolved</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issues List */}
            <div className="lg:col-span-2 space-y-4">
              {issues.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                  No issues found.
                </div>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition ${
                      selectedIssue?.id === issue.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex justify-between items-start mb-2">
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
                    <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
                      <span>Location: {issue.location}</span>
                      <span>Category: {issue.category}</span>
                      <span>Upvotes: {issue.upvotes || 0}</span>
                      <span>Date: {formatDate(issue.createdAt)}</span>
                    </div>
                    {issue.mediaURLs && issue.mediaURLs.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {issue.mediaURLs.slice(0, 3).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Issue ${idx + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Response Panel */}
            <div className="lg:col-span-1">
              {selectedIssue ? (
                <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">Respond to Issue</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Type
                      </label>
                      <select
                        value={responseType}
                        onChange={(e) => setResponseType(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="resolved">Problem Solved</option>
                        <option value="in_progress">In Progress</option>
                        <option value="unresolved">Not Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Details *
                      </label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={6}
                        className="w-full p-3 border rounded-lg"
                        placeholder={
                          responseType === "resolved"
                            ? "What was done? How was it done? Date completed..."
                            : responseType === "in_progress"
                            ? "What is being done? Expected timeline..."
                            : "Clear reason (budget, jurisdiction, legal, technical)..."
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Proof (Before/After photos, documents)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="w-full p-2 border rounded-lg"
                      />
                      {responseFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {responseFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 flex-1 truncate">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSubmitResponse}
                      disabled={saving}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Submitting..." : "Submit Response"}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedIssue(null);
                        setResponseText("");
                        setResponseFiles([]);
                      }}
                      className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Select an issue to respond
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

