import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Time format helper
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomePage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newFeedIds, setNewFeedIds] = useState(new Set()); // duplicate prevention
  const [showToast, setShowToast] = useState(false);
  const socketRef = useRef(null);

  // ─── Fetch feeds from API ─────────────────────────────────────────────────
  const fetchFeeds = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/feed`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFeeds(data.data);
      setSource(data.source);
    } catch (err) {
      setError("Feeds is not loading. Check the server is running?");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Socket.IO setup ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchFeeds();

    // Socket create karo with reconnection (Bonus)
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Realtime new feed event
    socket.on("new_feed", (feed) => {
      // Bonus: Duplicate prevention - same ID dobara add mat karo
      if (newFeedIds.has(feed._id)) return;

      setNewFeedIds((prev) => new Set([...prev, feed._id]));
      setFeeds((prev) => [feed, ...prev]); // top pe add karo
      setSource("realtime");

      // Toast notification show karo
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <h1 className="page-title">Coaching Feed</h1>
          <div className="connection-badge">
            <div className={`connection-dot ${isConnected ? "connected" : ""}`} />
            {isConnected ? "Live" : "Offline"}
          </div>
        </div>
        <p className="page-subtitle">Realtime coaching updates from your mentors</p>
      </div>

      {/* Source Badge */}
      {source && (
        <div className={`source-badge ${source === "cache" ? "cache" : "database"}`}>
          {source === "cache" ? "⚡ Redis Cache" : source === "realtime" ? "🔴 Realtime" : "🗄️ Database"}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-wrapper">
          <div className="spinner" />
          <span>Feeds is not loading...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
          <button
            onClick={fetchFeeds}
            style={{ marginLeft: "1rem", cursor: "pointer", background: "none", border: "none", color: "inherit", textDecoration: "underline" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && feeds.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3>No feeds available at the moment</h3>
          <p>Visit the admin page to add your first feed!</p>
        </div>
      )}

      {/* Feed list */}
      {!loading && feeds.map((feed) => (
        <div
          key={feed._id}
          className={`feed-card ${newFeedIds.has(feed._id) ? "new" : ""}`}
        >
          <span className={`feed-category category-${feed.category || "general"}`}>
            {feed.category || "general"}
          </span>
          <h2 className="feed-title">{feed.title}</h2>
          <p className="feed-content">{feed.content}</p>
          <div className="feed-meta">
            <div className="feed-author">
              <div className="author-avatar">
                {feed.author?.charAt(0).toUpperCase()}
              </div>
              {feed.author}
            </div>
            <span>{timeAgo(feed.createdAt)}</span>
          </div>
        </div>
      ))}

      {/* Toast notification */}
      {showToast && (
        <div className="new-feed-toast">
          🔴 New Feed Came!
        </div>
      )}
    </div>
  );
}
