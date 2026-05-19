const setupSocket = (io) => {
  // Connected clients track karo (duplicate prevention ke liye)
  const connectedClients = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    connectedClients.set(socket.id, { connectedAt: new Date() });

    // Client ko confirm karo
    socket.emit("connected", {
      message: "Realtime connection established!",
      socketId: socket.id,
    });

    // Disconnect handle
    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} | Reason: ${reason}`);
      connectedClients.delete(socket.id);
    });

    // Reconnect event (bonus: reconnect handling)
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt ${attempt} for ${socket.id}`);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return { connectedClients };
};

module.exports = setupSocket;
