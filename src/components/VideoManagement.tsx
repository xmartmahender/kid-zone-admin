// File: C:\Users\PMYLS\Desktop\Mahendar Website\Admin-Dashboard-for-Kidz-Zone (2)\kidz-zone-admin\src\components\VideoManagement.tsx
import React, { useState, useEffect } from "react";
import { 
  collection, addDoc, updateDoc, deleteDoc, getDocs, 
  doc, query, orderBy, Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export type Video = {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  ageGroup: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [ageGroup, setAgeGroup] = useState("0-3");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const videosData: Video[] = [];
      querySnapshot.forEach((doc) => {
        videosData.push({ id: doc.id, ...doc.data() } as Video);
      });
      setVideos(videosData);
    } catch (error) {
      console.error("Failed to load videos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) {
      alert("Please enter a video URL");
      return;
    }

    try {
      let thumbnailUrl = "";
      if (thumbnailFile) {
        const storageRef = ref(storage, `thumbnails/${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(storageRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(storageRef);
      } else if (editingId) {
        // If editing and no new thumbnail, keep existing one
        const existingVideo = videos.find(v => v.id === editingId);
        thumbnailUrl = existingVideo?.thumbnailUrl || "";
      } else {
        // Try to get YouTube thumbnail automatically
        const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (youtubeMatch && youtubeMatch[1]) {
          thumbnailUrl = `https://i3.ytimg.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
        } else {
          thumbnailUrl = "https://via.placeholder.com/640x360?text=Video+Thumbnail";
        }
      }

      if (editingId) {
        const videoRef = doc(db, "videos", editingId);
        await updateDoc(videoRef, { 
          title, description, videoUrl, thumbnailUrl, ageGroup,
          updatedAt: Timestamp.now() 
        });
      } else {
        await addDoc(collection(db, "videos"), {
          title,
          description,
          videoUrl,
          thumbnailUrl,
          ageGroup,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      resetForm();
      loadVideos();
    } catch (error) {
      console.error("Error saving video", error);
    }
  };

  const handleDelete = async (id: string, thumbnailUrl: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      // Delete thumbnail from storage if it's our Firebase URL
      if (thumbnailUrl && thumbnailUrl.includes("firebasestorage")) {
        try {
          const imageRef = ref(storage, thumbnailUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Error deleting thumbnail image", err);
        }
      }
      
      // Delete video document
      await deleteDoc(doc(db, "videos", id));
      loadVideos();
    } catch (error) {
      console.error("Error deleting video", error);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingId(video.id ?? null);
    setTitle(video.title);
    setDescription(video.description);
    setVideoUrl(video.videoUrl);
    setAgeGroup(video.ageGroup);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setAgeGroup("0-3");
    setThumbnailFile(null);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Video" : "Add New Video"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="0-3">0-3 years</option>
              <option value="3-6">3-6 years</option>
              <option value="6-9">6-9 years</option>
              <option value="9-12">9-12 years</option>
            </select>
          </div>
        </div>
        <div className="my-4">
          <label className="block mb-2">Video URL (YouTube, Vimeo, etc.)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </div>
        <div className="my-4">
          <label className="block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div className="my-4">
          <label className="block mb-2">Custom Thumbnail (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setThumbnailFile(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to use default YouTube thumbnail for YouTube videos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded font-bold"
          >
            {editingId ? "Update Video" : "Add Video"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        {loading ? (
          <p>Loading videos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border rounded p-3">
                <div className="h-40 overflow-hidden mb-2 relative">
                  <img
                    src={video.thumbnailUrl || "https://via.placeholder.com/640x360?text=Video"}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-2">Age: {video.ageGroup}</p>
                <p className="text-sm mb-3 line-clamp-2">{video.description}</p>
                <div className="flex justify-between">
                  <button
                    onClick={() => handleEdit(video)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => video.id && handleDelete(video.id, video.thumbnailUrl)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}