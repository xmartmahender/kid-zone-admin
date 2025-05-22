import React, { useState, useEffect } from "react";
import { 
  collection, addDoc, updateDoc, deleteDoc, getDocs, 
  doc, query, orderBy, Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export type Story = {
  id?: string;
  title: string;
  link: string;
  ageGroup: string;
  coverUrl: string;
  isCodeStory?: boolean;
  codeSnippet?: string;
  programmingLanguage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isTemporary?: boolean;
}

export function StoryManagement() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [ageGroup, setAgeGroup] = useState("0-3");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCodeStory, setIsCodeStory] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [programmingLanguage, setProgrammingLanguage] = useState("javascript");
  const [isTemporary, setIsTemporary] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const storiesData: Story[] = [];
      querySnapshot.forEach((doc) => {
        storiesData.push({ id: doc.id, ...doc.data() } as Story);
      });
      setStories(storiesData);
    } catch (error) {
      console.error("Failed to load stories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let coverUrl = "";
      
      if (uploadMethod === "file" && coverFile) {
        try {
          const fileName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
          const storageRef = ref(storage, `covers/${fileName}`);
          
          await uploadBytes(storageRef, coverFile);
          coverUrl = await getDownloadURL(storageRef);
          
          console.log("Successfully uploaded image, URL:", coverUrl);
        } catch (err) {
          console.error("Error uploading file:", err);
          alert("There was an error uploading the file. Using a placeholder instead.");
          coverUrl = "https://placehold.co/400x300/png?text=Story";
        }
      } else if (uploadMethod === "url" && coverUrlInput) {
        coverUrl = coverUrlInput;
      } else if (editingId) {
        const existingStory = stories.find(s => s.id === editingId);
        coverUrl = existingStory?.coverUrl || "https://placehold.co/400x300/png?text=Story";
      } else {
        coverUrl = "https://placehold.co/400x300/png?text=Story";
      }

      const storyData: Partial<Story> = {
        title,
        link,
        ageGroup,
        coverUrl,
        isCodeStory,
        isTemporary,
        updatedAt: Timestamp.now()
      };

      if (isCodeStory) {
        storyData.codeSnippet = codeSnippet;
        storyData.programmingLanguage = programmingLanguage;
      }

      if (editingId) {
        const storyRef = doc(db, "stories", editingId);
        await updateDoc(storyRef, storyData);
      } else {
        await addDoc(collection(db, "stories"), {
          ...storyData,
          createdAt: Timestamp.now()
        });
      }
      
      resetForm();
      loadStories();
    } catch (error) {
      console.error("Error saving story", error);
      alert("Failed to save story. Please try again.");
    }
  };

  const handleDelete = async (id: string, coverUrl: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      if (coverUrl && coverUrl.includes("firebasestorage")) {
        try {
          const imageRef = ref(storage, coverUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Error deleting cover image", err);
        }
      }
      
      await deleteDoc(doc(db, "stories", id));
      loadStories();
    } catch (error) {
      console.error("Error deleting story", error);
    }
  };

  const handleEdit = (story: Story) => {
    setEditingId(story.id ?? null);
    setTitle(story.title);
    setLink(story.link);
    setAgeGroup(story.ageGroup || "0-3");
    setIsCodeStory(story.isCodeStory || false);
    setIsTemporary(story.isTemporary || false);
    
    if (story.isCodeStory) {
      setCodeSnippet(story.codeSnippet || "");
      setProgrammingLanguage(story.programmingLanguage || "javascript");
    }
    
    if (story.coverUrl && !story.coverUrl.includes("firebasestorage") && 
        !story.coverUrl.includes("placeholder")) {
      setCoverUrlInput(story.coverUrl);
      setUploadMethod("url");
    } else {
      setUploadMethod("file");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setLink("");
    setAgeGroup("0-3");
    setCoverFile(null);
    setCoverUrlInput("");
    setUploadMethod("file");
    setIsCodeStory(false);
    setCodeSnippet("");
    setProgrammingLanguage("javascript");
    setIsTemporary(false);
  };

  return (
    <div className="w-full">
      <div className="bg-white p-4 shadow rounded mb-6">
        <h2 className="text-xl font-semibold mb-4">Stories</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isCodeStory}
                onChange={(e) => setIsCodeStory(e.target.checked)}
                className="mr-2"
              />
              <span>This is a code story/tutorial</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isTemporary}
                onChange={(e) => setIsTemporary(e.target.checked)}
                className="mr-2"
              />
              <span>This is a temporary story</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Story Title"
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
            <label className="block mb-2">
              {isCodeStory ? "External Resource Link (Optional)" : "Story Link"}
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={isCodeStory ? "Optional: Add a related resource link" : "Story Link"}
              required={!isCodeStory}
            />
          </div>

          {isCodeStory && (
            <>
              <div className="my-4">
                <label className="block mb-2">Programming Language</label>
                <select
                  value={programmingLanguage}
                  onChange={(e) => setProgrammingLanguage(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                </select>
              </div>
              
              <div className="my-4">
                <label className="block mb-2">Code Snippet</label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your code snippet here"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Provide a code snippet for the story/tutorial
                </p>
              </div>
            </>
          )}

          <div className="my-4">
            <label className="block mb-2">Cover Image</label>
            <div className="flex gap-4 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={uploadMethod === "file"}
                  onChange={() => setUploadMethod("file")}
                  className="mr-2"
                />
                Upload from Computer
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={uploadMethod === "url"}
                  onChange={() => setUploadMethod("url")}
                  className="mr-2"
                />
                Use Image URL
              </label>
            </div>
            
            {uploadMethod === "file" ? (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setCoverFile(e.target.files[0])}
                className="w-full p-2 border rounded"
              />
            ) : (
              <input
                type="url"
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter image URL"
              />
            )}
            <p className="text-sm text-gray-500 mt-1">
              Optional: {uploadMethod === "file" ? "Upload a cover image" : "Provide an image URL"} for the story
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded font-bold"
          >
            {editingId ? "Update Story" : "Add Story"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 ml-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          )}
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Loading stories...</p>
          ) : (
            stories.map((story) => (
              <div key={story.id} className={`border rounded overflow-hidden shadow-sm ${story.isTemporary ? 'border-orange-500' : ''}`}>
                <div className="h-40 overflow-hidden">
                  <img 
                    src={story.coverUrl || "https://via.placeholder.com/400x300?text=No+Cover"} 
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                    }}
                  />
                </div>
                <div className="p-3">
                  <div className="mb-2">
                    <a 
                      href={story.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {story.title}
                    </a>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm text-gray-600">
                        Age: {story.ageGroup || "Not specified"}
                      </span>
                      {story.isTemporary && (
                        <span className="text-sm text-orange-600 font-medium">
                          Temporary
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(story)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded flex-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => story.id && handleDelete(story.id, story.coverUrl || "")}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}