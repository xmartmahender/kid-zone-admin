import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Film,
  FileText,
  Users,
  LogOut,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { VideoManagement } from "./components/VideoManagement";
import { StoryManagement } from "./components/StoryManagement";

const ADMIN_PASSWORD = "admin123";

// Sections for the dashboard
const sections = [
  { key: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "stories", name: "Stories", icon: <BookOpen size={20} /> },
  { key: "videos", name: "Videos", icon: <Film size={20} /> },
  { key: "posts", name: "Posts", icon: <FileText size={20} /> },
  { key: "users", name: "Users", icon: <Users size={20} /> },
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Incorrect password");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl px-8 py-10 shadow-xl flex flex-col items-center w-80 border border-purple-200"
      >
        <h1 className="text-3xl font-bold mb-6 text-purple-700">Admin Login</h1>
        <input
          type="password"
          value={password}
          placeholder="Enter admin password"
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 px-4 py-2 rounded border border-purple-300 focus:border-purple-500 outline-none w-full transition"
        />
        <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded font-bold hover:scale-105 shadow transition-all duration-200" type="submit">Login</button>
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </form>
    </div>
  );
}

function Sidebar({
  current,
  onChange,
  onLogout,
}: {
  current: string;
  onChange: (key: string) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="bg-gradient-to-b from-purple-600 to-pink-400 w-56 min-h-screen py-8 px-4 flex flex-col gap-6 shadow-lg text-white fixed z-40">
      <div className="mb-8 text-center flex items-center justify-center gap-2">
        <BookOpen size={30} />
        <span className="font-black text-2xl tracking-tight">KidzZone</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {sections.map(({ key, name, icon }) => (
          <button
            key={key}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold hover:bg-pink-500/30 focus:outline-none transition ${
              current === key ? "bg-white/15 text-yellow-200" : ""
            }`}
            style={{ background: current === key ? "rgba(255,255,255,0.1)" : undefined }}
            onClick={() => onChange(key)}
          >
            {icon} {name}
          </button>
        ))}
      </nav>
      <button
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold hover:bg-yellow-400/30 text-yellow-300 transition bg-white/0"
        onClick={onLogout}
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full max-w-2xl border border-slate-100">
      <h2 className="font-extrabold text-xl text-purple-700 flex items-center gap-2 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ProDashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState("dashboard");

  // Simulate a visitor counter
  const [visitorCount] = useState(2024);

  // Stories and Videos state
  const [stories, setStories] = useState([
    { title: "The Lion and the Mouse", link: "https://example.com/story1" },
    { title: "Clever Rabbit", link: "https://example.com/story2" },
  ]);
  const [videos, setVideos] = useState([
    { title: "ABC Song", link: "https://example.com/video1" },
    { title: "Counting Numbers", link: "https://example.com/video2" },
  ]);
  const [posts, setPosts] = useState([
    { title: "Fun Facts for Kids", link: "https://example.com/post1" },
    { title: "Learning With Games", link: "https://example.com/post2" },
  ]);
  const [users] = useState([
    { name: "Alice" },
    { name: "Bob" },
    { name: "Charlie" },
  ]);
  const connectedCount = users.length;

  // Add input states
  const [storyTitle, setStoryTitle] = useState("");
  const [storyLink, setStoryLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postLink, setPostLink] = useState("");

  // Simulated chart data for connected users by hour
  const chartData = [
    { hour: "09:00", users: 1 },
    { hour: "10:00", users: 2 },
    { hour: "11:00", users: 2 },
    { hour: "12:00", users: 3 },
    { hour: "13:00", users: 2 },
    { hour: "14:00", users: 3 },
    { hour: "15:00", users: 3 },
    { hour: "16:00", users: 2 } // latest
  ];

  // Handlers
  const addStory = () => {
    if (storyTitle.trim() && storyLink.trim()) {
      setStories([...stories, { title: storyTitle, link: storyLink }]);
      setStoryTitle("");
      setStoryLink("");
    }
  };
  const deleteStory = (idx: number) => {
    setStories(stories.filter((_, i) => i !== idx));
  };
  const addVideo = () => {
    if (videoTitle.trim() && videoLink.trim()) {
      setVideos([...videos, { title: videoTitle, link: videoLink }]);
      setVideoTitle("");
      setVideoLink("");
    }
  };
  const deleteVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };
  const addPost = () => {
    if (postTitle.trim() && postLink.trim()) {
      setPosts([...posts, { title: postTitle, link: postLink }]);
      setPostTitle("");
      setPostLink("");
    }
  };
  const deletePost = (idx: number) => {
    setPosts(posts.filter((_, i) => i !== idx));
  };

  // Responsive main content area
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      <Sidebar current={section} onChange={setSection} onLogout={onLogout} />
      <div className="flex-1 min-h-screen pl-0 md:pl-56 flex flex-col">
        <header className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg sticky top-0 z-30 w-full">
          <div className="flex items-center justify-between p-4 md:pl-8">
            <span className="text-2xl font-bold text-gray-100">Kidz Zone Admin</span>
            <button
              className="md:hidden flex items-center gap-2 text-white font-bold"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center px-2 py-8 md:p-8">
          {section === "dashboard" && (
            <>
              <div className="w-full flex flex-col gap-6 max-w-4xl mb-8">
                <Card title="Connected Users (Today)">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} width={30} tick={{fontSize: 13}} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#a21caf" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              <Card title="Welcome">
                <div className="text-gray-700">
                  Welcome, admin! Use the sidebar to manage stories, videos, posts, and users.
                </div>
              </Card>
            </>
          )}
          {section === "stories" && (
            <StoryManagement />
          )}
          {section === "videos" && (
            <VideoManagement />
          )}
          {section === "posts" && (
            <Card title="Posts">
              <div className="flex flex-col space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="rounded px-3 py-2 border mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Post Link"
                  value={postLink}
                  onChange={e => setPostLink(e.target.value)}
                  className="rounded px-3 py-2 border w-full"
                />
                <button
                  onClick={addPost}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded font-bold mt-2 hover:scale-105 transition"
                >Add Post</button>
              </div>
              <ul className="divide-y">
                {posts.map((post, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2">
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline font-medium">{post.title}</a>
                    <button
                      onClick={() => deletePost(idx)}
                      className="ml-3 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-bold text-xs"
                    >Delete</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {section === "users" && (
            <Card title="Users Connected">
              <div className="flex items-center mb-4">
                <span className="text-lg font-bold text-indigo-600 mr-2">Connected:</span>
                <span className="text-2xl font-extrabold text-purple-700">{connectedCount}</span>
              </div>
              <ul className="divide-y">
                {users.map((user, idx) => (
                  <li key={idx} className="py-2 flex items-center">
                    <span className="font-medium text-gray-800">{user.name}</span>
                    <span className="ml-2 inline-block bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full">Online</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </main>
        <footer className="text-gray-600 body-font bg-gradient-to-r from-pink-500 to-purple-500 py-6 text-center">
          <span className="font-bold text-yellow-200 text-2xl">Stormiz</span>
          <div className="text-white mt-2">© 2025 Stormiz — Admin Panel Demo</div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? (
    <div className="app">
      <ProDashboard onLogout={() => setLoggedIn(false)} />
    </div>
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

export default App;
