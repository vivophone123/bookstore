require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: process.env.CLIENT_URL || "*", // กำหนด Origin ที่แน่นอนเพื่อความปลอดภัย (OWASP A01)
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully ✅"))
  .catch((err) => {
    console.error("MongoDB error ❌:", "Connection failed"); 
    process.exit(1);
  });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/product"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/coupons", require("./routes/coupon")); 

app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});


// 5. Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
  },
});

let onlineUsers = [];

// Socket Logic
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  
  socket.on("addUser", (userId) => {
    if (userId && !onlineUsers.some((u) => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
      console.log(`User ${userId} is now online.`);
    }
    io.emit("getUsers", onlineUsers);
  });

 
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiver = onlineUsers.find((u) => u.userId === receiverId);
    
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", {
        senderId,
        text,
        createdAt: new Date(), 
      });
    }
  });

  
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getUsers", onlineUsers);
    console.log("A user disconnected.");
  });
});


server.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
});

// Handle Uncaught Exceptions
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});