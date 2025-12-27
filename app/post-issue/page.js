"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../components/Navbar";

export default function PostIssuePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("roads");
  const [location, setLocation] = useState("");
  const [taggedAuthority, setTaggedAuthority] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.google && !mapInstanceRef.current) {
        initMap();
      } else {
        const checkGoogle = setInterval(() => {
          if (window.google && !mapInstanceRef.current) {
            clearInterval(checkGoogle);
            initMap();
          }
        }, 100);
        return () => clearInterval(checkGoogle);
      }
    }
  }, []);

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi default
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
    });

    markerRef.current = new window.google.maps.Marker({
      map: mapInstanceRef.current,
      draggable: true,
    });

    mapInstanceRef.current.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedLocation({ lat, lng });
      markerRef.current.setPosition({ lat, lng });
      
      // Reverse geocode
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setLocation(results[0].formatted_address);
        }
      });
    });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstanceRef.current.setCenter(pos);
          markerRef.current.setPosition(pos);
          setSelectedLocation(pos);
          
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results[0]) {
              setLocation(results[0].formatted_address);
            }
          });
        },
        () => {
          console.log("Geolocation failed");
        }
      );
    }

    setMapLoaded(true);
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  }

  function removeFile(index) {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  }

  async function uploadFiles() {
    const urls = [];
    for (const file of selectedFiles) {
      const storageRef = ref(storage, `issues/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (!title.trim()) return alert("Please enter a title");
    if (!description.trim()) return alert("Please enter a description");
    if (!location.trim()) return alert("Please select a location");

    setSaving(true);
    try {
      let mediaURLs = [];
      if (selectedFiles.length > 0) {
        mediaURLs = await uploadFiles();
      }

      await addDoc(collection(db, "issues"), {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        taggedAuthority: taggedAuthority.trim() || "General",
        geoLocation: selectedLocation || null,
        mediaURLs,
        userId: user.uid,
        userEmail: user.email,
        upvotes: 0,
        upvotedBy: [],
        status: "open",
        createdAt: serverTimestamp(),
      });

      alert("Issue reported successfully!");
      router.push("/");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit issue: " + err.message);
    } finally {
      setSaving(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Report a Civic Issue
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Pothole on Main Street"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="roads">Roads</option>
                  <option value="water">Water Supply</option>
                  <option value="waste">Waste Management</option>
                  <option value="electricity">Electricity</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Authority
                </label>
                <input
                  type="text"
                  value={taggedAuthority}
                  onChange={(e) => setTaggedAuthority(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Municipal Corporation of Delhi"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location * (Click on map or enter address)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder="Enter address or click on map"
                required
              />
              <div
                ref={mapRef}
                className="w-full h-64 border rounded-lg"
                style={{ minHeight: "256px" }}
              />
              {!mapLoaded && (
                <p className="text-sm text-gray-500 mt-2">
                  Loading map... (Make sure Google Maps API key is configured)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="w-full p-2 border rounded-lg"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit Issue"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

