const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const dotenv = require("dotenv");

// Apply patches to fix deprecation warnings
require("./patches/apply-patches");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");
const Kanban = require("./models/Kanban");
const Project = require("./models/Project");
// const dragula = require("dragula");

const indexRoutes = require("./routes/indexRoutes");
const profileRoutes = require("./routes/profileRoutes");
const loginRoutes = require("./routes/loginRoutes");
const postRoutes = require("./routes/postRoutes");
const projectRoutes = require("./routes/projectRoutes");
const signupRoutes = require("./routes/signupRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const morgan = require("morgan");
const connectDB = require("./config/database");
const ejs = require("ejs");

const authRoutes = require("./routes/auth");
const path = require("path");
// load the config
dotenv.config({ path: "./config/.env" });

//Passport config
require("./config/passport")(passport); //i'm passing variable passport as an argument

connectDB();
const PORT = process.env.PORT || 8000;
const app = express();

//setup socket.io
const http = require("http"); //Socket.IO requires a raw HTTP server
const server = http.createServer(app); //creates an HTTP server using your Express application as its request handler.
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("get-project-info", async (projectId) => {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        socket.emit("project-info", null); // Send null if project not found
        return;
      }
      socket.emit("project-info", project); // Send project data to the client
    } catch (err) {
      console.error("Error fetching project info:", err);
      socket.emit("project-info", null); // Send null on error
    }
  });

  socket.on("join-room", (roomName, roomId) => {
    console.log(`User joined room: ${roomName}`);
    socket.join(roomId);
  });

  socket.on("project-update", (data) => {
    socket.broadcast.emit("project-update", data);
  });
  socket.on("send-message", (message, roomId) => {
    console.log(`Message received for room ${roomId}: ${message}`);
    io.to(roomId).emit("receive-message", message);

    console.log('socket.on("line 53 server.js send-message"', message);
    // socket.broadcast.emit('project-update',data);
  });
  socket.on("disconnect", () => {
    console.log(`socket.on("disconnect"User disconnected: ${socket.id}`);
  });
  socket.on("join-room", (roomName, room) => {
    socket.join(room);
    console.log(
      `socket.on("join-room" Server side: User connected ${roomName}, line 62 server.ejs`
    );
  });
  socket.on(`updateBoard`, async (boardState) => {
    try {
      const { projectId } = boardState;
      console.log("projectId", projectId);
      await Kanban.findOneAndUpdate(
        { projectId: projectId },
        { columns: boardState.columns },
        { new: true, upsert: true }
      ).lean();

      socket.broadcast.emit("board-updated", boardState);
      console.log("server socket is trying to loadFromLocalStorage");
    } catch (error) {
      console.error("Error handling board update:", error);
    }
  });
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
// app.use("/public", express.static("public"));

// Log each request to see the flow
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// View engine
app.set("view engine", "ejs");

//Express-session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    //this was stoping us from being logged in as true
    cookie: { secure: process.env.NODE_ENV === "production" },
    //this was required do to an updated module
    store: MongoStore.create({ mongoUrl: process.env.DB_STRING }),
  })
);

// Add flash middleware AFTER session middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables for views (including flash messages)
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error"); // Passport failureFlash uses 'error'
  res.locals.error = req.flash("error"); // Common convention, makes it accessible via error or error_msg
  res.locals.user = req.user || null; // Make user object available globally if logged in
  next();
});

//static folder
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  }
  next();
});
// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/login", loginRoutes);
app.use("/post", postRoutes);
app.use("/project", projectRoutes);
app.use("/signup", signupRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

//NODE_ENV is going to let us know what stage of development we're in when booting.
server.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
