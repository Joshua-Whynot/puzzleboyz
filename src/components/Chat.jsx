import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const WS_URL =
    import.meta.env.VITE_WS_URL ||
    "https://stunnedly-unabrogated-sadye.ngrok-free.dev/";

function getStoredName() {
    if (typeof window === "undefined") return "";
    const stored = localStorage.getItem("chatName");
    if (stored) return stored;
    return "";
}

export default function Chat() {
    const socketRef = useRef(null);
    const [status, setStatus] = useState("disconnected");
    const [connectError, setConnectError] = useState(null);
    const [username, setUsername] = useState(getStoredName());
    const [editingName, setEditingName] = useState(!getStoredName());
    const [nameInput, setNameInput] = useState(getStoredName());
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const socket = io(WS_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            setStatus("connected");
            setConnectError(null);
            // Request all messages from server
            socket.emit("getAllMessages", null, (allMessages) => {
                if (Array.isArray(allMessages)) {
                    setMessages(allMessages);
                }
            });
        });

        socket.on("disconnect", (reason) => {
            setStatus("disconnected");
        });

        socket.on("message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("connect_error", (err) => {
            setStatus("error");
            setConnectError(err?.message || String(err));
        });

        return () => {
            socket.off();
            socket.close();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !username.trim()) return;
        const msg = { username, message: input.trim() };
        socketRef.current.emit("message", msg);
        setInput("");
    };

    const handleNameSave = () => {
        const trimmed = nameInput.trim().slice(0, 30);
        if (trimmed) {
            setUsername(trimmed);
            localStorage.setItem("chatName", trimmed);
            setEditingName(false);
        }
    };

    return (
        <div className="chat-widget">
            <div className="chat-panel">
                <div className="chat-header">
                    <span className="chat-title">茶馆 Chat</span>
                    <span className={`chat-status chat-${status}`}>
                        {status}
                    </span>
                </div>
                <div className="chat-name-bar">
                    {editingName ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleNameSave();
                            }}
                            className="chat-name-form"
                        >
                            <input
                                className="chat-name-input"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                maxLength={30}
                                autoFocus
                                placeholder="Enter name..."
                            />
                            <button type="submit" className="chat-name-save">
                                ✓
                            </button>
                        </form>
                    ) : (
                        <button
                            className="chat-name-display"
                            onClick={() => setEditingName(true)}
                            title="Click to change name"
                        >
                            {username} ✎
                        </button>
                    )}
                </div>
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            No messages yet. Say hello!
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`chat-msg ${
                                msg.username === username ? "chat-msg-self" : ""
                            }`}
                        >
                            <span className="chat-msg-name">
                                {msg.username}
                            </span>
                            <span className="chat-msg-text">{msg.message}</span>
                        </div>
                    ))}
                </div>
                <form className="chat-input-bar" onSubmit={sendMessage}>
                    <input
                        className="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        maxLength={500}
                        disabled={!username}
                    />
                    <button
                        type="submit"
                        className="chat-send"
                        disabled={!input.trim() || !username}
                    >
                        发送
                    </button>
                </form>
                {connectError && (
                    <div className="chat-msg chat-msg-error">
                        <span className="chat-msg-name">Error</span>
                        <span className="chat-msg-text">{connectError}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
