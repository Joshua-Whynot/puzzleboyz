import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const PORT = process.env.WS_PORT || 3001

const server = createServer()
const wss = new WebSocketServer({ server })

const clients = new Set()
const recentMessages = [] // Keep last 50 messages for new joiners
const MAX_HISTORY = 50

function broadcast(data, exclude = null) {
    const msg = JSON.stringify(data)
    for (const client of clients) {
        if (client !== exclude && client.readyState === 1) {
            client.send(msg)
        }
    }
}

wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`Client connected (${clients.size} online)`)

    // Send recent chat history to the new client
    if (recentMessages.length > 0) {
        ws.send(JSON.stringify({ type: 'history', messages: recentMessages }))
    }

    // Send online count to everyone
    broadcast({ type: 'online', count: clients.size })

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw)

            if (data.type === 'chat' && data.name && data.text) {
                const message = {
                    type: 'chat',
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    name: data.name.slice(0, 30),
                    text: data.text.slice(0, 500),
                    timestamp: Date.now(),
                }

                recentMessages.push(message)
                if (recentMessages.length > MAX_HISTORY) {
                    recentMessages.shift()
                }

                // Broadcast to everyone except sender
                broadcast(message, ws)
            }
        } catch {
            // Ignore malformed messages
        }
    })

    ws.on('close', () => {
        clients.delete(ws)
        console.log(`Client disconnected (${clients.size} online)`)
        broadcast({ type: 'online', count: clients.size })
    })
})

server.listen(PORT, () => {
    console.log(`WebSocket server running on ws://localhost:${PORT}`)
})
