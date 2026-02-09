import { useState, useEffect } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { MessageSquare, Heart, Share2, Send, MoreHorizontal, User } from "lucide-react";
import "./Forum.css";

function PostItem({ post, onReply }) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    // Recursive render for nested replies? 
    // For simplicity and cleaner UI, let's keep it 1 level deep visually in this pro version 
    // or use indentation.
    // Let's implement indentation.

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        await onReply(post.id, replyContent);
        setReplyContent("");
        setShowReplyInput(false);
    };

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "Justo ahora";
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
        return date.toLocaleDateString();
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-avatar">
                    {post.author_username?.charAt(0).toUpperCase() || <User size={20} />}
                </div>
                <div className="post-meta">
                    <span className="post-author">{post.author_username || "Usuario"}</span>
                    <span className="post-time">{timeAgo(post.created_at)}</span>
                </div>
                <button style={{ marginLeft: "auto", border: "none", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="post-body">
                {post.content}
            </div>

            <div className="post-footer">
                <button className="action-link">
                    <Heart size={18} /> Me gusta
                </button>
                <button className="action-link" onClick={() => setShowReplyInput(!showReplyInput)}>
                    <MessageSquare size={18} />
                    {post.replies?.length > 0 ? `${post.replies.length} Respuestas` : "Responder"}
                </button>
                <button className="action-link">
                    <Share2 size={18} /> Compartir
                </button>
            </div>

            {/* Replies Section */}
            {(showReplyInput || post.replies?.length > 0) && (
                <div className="replies-section">
                    {post.replies?.map(reply => (
                        <div key={reply.id} className="reply-item">
                            <div style={{ display: "flex", gap: 10, fontSize: "0.9rem" }}>
                                <strong style={{ color: "#334155" }}>{reply.author_username}</strong>
                                <span style={{ color: "#94a3b8" }}>{timeAgo(reply.created_at)}</span>
                            </div>
                            <p style={{ margin: "4px 0", color: "#475569" }}>{reply.content}</p>
                        </div>
                    ))}

                    {showReplyInput && (
                        <form onSubmit={handleSubmitReply} className="reply-input-area">
                            <input
                                className="reply-input"
                                placeholder="Escribe una respuesta..."
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn-primary" style={{ padding: "8px 12px", borderRadius: "20px" }}>
                                <Send size={16} />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadPosts = async () => {
        try {
            // Assume ordering by -created_at from backend or sort here
            const res = await api.get("/api/forum/?ordering=-created_at");
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to load forum", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
        const interval = setInterval(loadPosts, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        try {
            await api.post("/api/forum/", { content: newPostContent });
            setNewPostContent("");
            loadPosts();
        } catch (error) {
            console.error("Failed to create post", error);
        }
    };

    const handleReply = async (parentId, content) => {
        try {
            await api.post("/api/forum/", { content, parent: parentId });
            loadPosts();
        } catch (error) {
            console.error("Failed to reply", error);
        }
    };

    return (
        <div className="forum-container">
            <div className="forum-header">
                <h2>Foro de Discusión</h2>
                <p>Espacio colaborativo para el equipo de seguridad y administración.</p>
            </div>

            {/* Create Post Widget */}
            <div className="new-post-card">
                <div className="current-user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || <User />}
                </div>
                <div className="new-post-content">
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            placeholder={`¿Qué tienes en mente, ${user?.username || 'usuario'}?`}
                        />
                        <div className="post-actions">
                            <button type="submit" className="btn-primary" disabled={!newPostContent.trim()}>
                                <Send size={16} /> Publicar Mensaje
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Feed */}
            <div>
                <h3 className="feed-label">Discusiones Recientes</h3>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Cargando discusiones...</div>
                ) : posts.length > 0 ? (
                    posts.map(post => {
                        // Only render top-level posts here, replies are handled inside PostItem
                        // Assuming backend returns flat list or nested. Check logic. 
                        // If flat list with 'parent', we need to nest them. 
                        // Assuming backend handles nesting or we filter here.
                        // Let's assume standard REST API returns list. We filter top level if needed.
                        // Ideally backend returns nested. If not, filtered here:
                        if (post.parent) return null;

                        // We need to attach replies to parents if flat list. 
                        // Or simplistic view: Render all if structure is flat.
                        // Let's assume backend returns nested 'replies' field as per previous Forum.jsx logic
                        return <PostItem key={post.id} post={post} onReply={handleReply} />;
                    })
                ) : (
                    <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
                        <p style={{ color: "#64748b" }}>No hay discusiones aún. ¡Sé el primero en publicar!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

