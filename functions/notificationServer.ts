import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Store WebSocket connections with userId as key
const connections = new Map();

Deno.serve(async (req) => {
  // Upgrade connection to WebSocket
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Not a WebSocket request', { status: 400 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { socket, response } = Deno.upgrade(req);
    const userId = user.id;

    // Store this connection
    if (!connections.has(userId)) {
      connections.set(userId, []);
    }
    connections.get(userId).push(socket);

    // Listen for messages from client
    try {
      for await (const msg of socket) {
        if (typeof msg === 'string') {
          // Client can send ping or other messages to keep connection alive
          const message = JSON.parse(msg);
          if (message.type === 'ping') {
            socket.send(JSON.stringify({ type: 'pong' }));
          }
        }
      }
    } catch (e) {
      // Connection closed
      const userSockets = connections.get(userId);
      if (userSockets) {
        const index = userSockets.indexOf(socket);
        if (index > -1) {
          userSockets.splice(index, 1);
        }
        if (userSockets.length === 0) {
          connections.delete(userId);
        }
      }
    }

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Export function to send notifications to connected users
export function broadcastNotification(userId, notification) {
  const userSockets = connections.get(userId);
  if (userSockets) {
    userSockets.forEach(socket => {
      try {
        socket.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      } catch (e) {
        console.error('Failed to send notification:', e);
      }
    });
  }
}