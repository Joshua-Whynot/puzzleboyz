import { useCallback, useEffect, useRef, useState } from 'react'

const ANIMAL_NAMES = [
    '熊猫', '老虎', '仙鹤', '金鱼', '凤凰',
    '麒麟', '白兔', '青蛙', '蝴蝶', '孔雀',
    '猴子', '龟', '鲤鱼', '燕子', '狐狸',
]

function getRandomName() {
    const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)]
    const num = Math.floor(Math.random() * 99) + 1
    return `${animal}${num}`
}

function getStoredName() {
    if (typeof window === 'undefined') return getRandomName()
    const stored = localStorage.getItem('chatName')
    if (stored) return stored
    const name = getRandomName()
    localStorage.setItem('chatName', name)
    return name
}

function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [name, setName] = useState(getStoredName)
    const [onlineCount, setOnlineCount] = useState(0)
    const [connected, setConnected] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState('')
    const wsRef = useRef(null)
    const messagesEndRef = useRef(null)
    const reconnectTimer = useRef(null)
    const closedIntentionally = useRef(false)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    useEffect(() => {
        closedIntentionally.current = false

        function connect() {
            // Close any existing connection first
            if (wsRef.current) {
                wsRef.current.onclose = null
                wsRef.current.close()
                wsRef.current = null
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const wsUrl = import.meta.env.PROD
                ? `${protocol}//${window.location.host}`
                : `ws://localhost:3001`

            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                setConnected(true)
            }

            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data)
                    if (data.type === 'chat') {
                        setMessages((prev) => {
                            if (data.id && prev.some((m) => m.id === data.id)) return prev
                            return [...prev, data]
                        })
                    } else if (data.type === 'history') {
                        setMessages(data.messages)
                    } else if (data.type === 'online') {
                        setOnlineCount(data.count)
                    }
                } catch {
                    // Ignore
                }
            }

            ws.onclose = () => {
                setConnected(false)
                // Only reconnect if we didn't close on purpose
                if (!closedIntentionally.current) {
                    reconnectTimer.current = setTimeout(connect, 3000)
                }
            }

            ws.onerror = () => {
                ws.close()
            }
        }

        connect()

        return () => {
            closedIntentionally.current = true
            clearTimeout(reconnectTimer.current)
            if (wsRef.current) {
                wsRef.current.onclose = null
                wsRef.current.close()
                wsRef.current = null
            }
        }
    }, [])

    const sendMessage = (e) => {
        e.preventDefault()
        const text = input.trim()
        if (!text || !wsRef.current || wsRef.current.readyState !== 1) return

        const localMsg = {
            type: 'chat',
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name,
            text,
            timestamp: Date.now(),
        }

        // Add locally so we see it immediately
        setMessages((prev) => [...prev, localMsg])

        wsRef.current.send(JSON.stringify({
            type: 'chat',
            name,
            text,
        }))
        setInput('')
    }

    const handleNameSave = () => {
        const trimmed = nameInput.trim().slice(0, 30)
        if (trimmed) {
            setName(trimmed)
            localStorage.setItem('chatName', trimmed)
        }
        setEditingName(false)
    }

    return (
        <div className={`chat-widget ${isOpen ? 'chat-open' : 'chat-closed'}`}>
            {/* Toggle button */}
            <button
                className="chat-toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? '✕' : '💬'}
                {!isOpen && onlineCount > 0 && (
                    <span className="chat-badge">{onlineCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="chat-panel">
                    {/* Header */}
                    <div className="chat-header">
                        <span className="chat-title">茶馆 Chat</span>
                        <span className={`chat-status ${connected ? 'chat-connected' : 'chat-disconnected'}`}>
                            {connected ? `${onlineCount} online` : 'reconnecting...'}
                        </span>
                    </div>

                    {/* Name bar */}
                    <div className="chat-name-bar">
                        {editingName ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleNameSave() }} className="chat-name-form">
                                <input
                                    className="chat-name-input"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    maxLength={30}
                                    autoFocus
                                    placeholder="Enter name..."
                                />
                                <button type="submit" className="chat-name-save">✓</button>
                            </form>
                        ) : (
                            <button
                                className="chat-name-display"
                                onClick={() => { setNameInput(name); setEditingName(true) }}
                                title="Click to change name"
                            >
                                {name} ✎
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-empty">No messages yet. Say hello!</div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`chat-msg ${msg.name === name ? 'chat-msg-self' : ''}`}
                            >
                                <span className="chat-msg-name">{msg.name}</span>
                                <span className="chat-msg-text">{msg.text}</span>
                                <span className="chat-msg-time">{formatTime(msg.timestamp)}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form className="chat-input-bar" onSubmit={sendMessage}>
                        <input
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            maxLength={500}
                            disabled={!connected}
                        />
                        <button
                            type="submit"
                            className="chat-send"
                            disabled={!connected || !input.trim()}
                        >
                            发送
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
