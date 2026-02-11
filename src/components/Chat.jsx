import { useCallback, useEffect, useRef, useState } from 'react'

const ANIMAL_NAMES = [
    '熊猫', '老虎', '仙鹤', '金鱼', '凤凰',
    '麒麟', '白兔', '青蛙', '蝴蝶', '孔雀',
    '猴子', '龟', '鲤鱼', '燕子', '狐狸',
]

// Pool of random Chinese phrases for the fake bots
const CHINESE_PHRASES = [
    '你好世界', '今天天气很好', '拼图太难了', '我喜欢拼图',
    '大家好', '哈哈哈', '加油加油', '太厉害了',
    '这个拼图很有趣', '我们是拼图男孩', '龙年大吉',
    '恭喜发财', '好运来了', '一起拼图吧', '厉害厉害',
    '真的吗', '太棒了', '继续努力', '我来了',
    '谁在这里', '晚上好', '早上好', '下午好',
    '拼图完成了', '还差一点', '快完成了', '好难啊',
    '不错不错', '很漂亮', '开心', '今天很开心',
    '明天见', '再来一个', '我最厉害', '你们好厉害',
    '一起加油', '拼图之王', '这个颜色好看', '差不多了',
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

function randomPhrase() {
    return CHINESE_PHRASES[Math.floor(Math.random() * CHINESE_PHRASES.length)]
}

// Generate a few fake bot names on mount
function makeBots(count = 4) {
    return Array.from({ length: count }, () => getRandomName())
}

export default function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [name, setName] = useState(getStoredName)
    const [isOpen, setIsOpen] = useState(false)
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState('')
    const messagesEndRef = useRef(null)
    const botsRef = useRef(makeBots())
    const botTimerRef = useRef(null)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Fake bot messages at random intervals
    useEffect(() => {
        function scheduleBot() {
            const delay = 3000 + Math.random() * 8000 // 3-11 seconds
            botTimerRef.current = setTimeout(() => {
                const botName = botsRef.current[Math.floor(Math.random() * botsRef.current.length)]
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        name: botName,
                        text: randomPhrase(),
                        timestamp: Date.now(),
                    },
                ])
                scheduleBot()
            }, delay)
        }

        scheduleBot()

        return () => clearTimeout(botTimerRef.current)
    }, [])

    const sendMessage = (e) => {
        e.preventDefault()
        const text = input.trim()
        if (!text) return

        setMessages((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name,
                text,
                timestamp: Date.now(),
            },
        ])
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

    const fakeOnline = botsRef.current.length + 1

    return (
        <div className={`chat-widget ${isOpen ? 'chat-open' : 'chat-closed'}`}>
            <button
                className="chat-toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? '✕' : '💬'}
                {!isOpen && (
                    <span className="chat-badge">{fakeOnline}</span>
                )}
            </button>

            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <span className="chat-title">茶馆 Chat</span>
                        <span className="chat-status chat-connected">
                            {fakeOnline} online
                        </span>
                    </div>

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

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-empty">No messages yet. Say hello!</div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={msg.id || i}
                                className={`chat-msg ${msg.name === name ? 'chat-msg-self' : ''}`}
                            >
                                <span className="chat-msg-name">{msg.name}</span>
                                <span className="chat-msg-text">{msg.text}</span>
                                <span className="chat-msg-time">{formatTime(msg.timestamp)}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-bar" onSubmit={sendMessage}>
                        <input
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            className="chat-send"
                            disabled={!input.trim()}
                        >
                            发送
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
