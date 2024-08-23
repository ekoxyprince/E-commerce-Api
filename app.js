const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const path = require("path");
const rootRoutes = require("./routes/index");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const compression = require("compression");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const logger = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { session_secret } = require("./config");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const expressErrorHandler = require("./middlewares/errorhandler");
const notFoundMiddleware = require("./middlewares/notfound");

const app = express();
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.set("trust proxy", 1);

const store = new MongoDBStore({
  uri:
    process.env.NODE_ENV === "development"
      ? process.env.LOCAL_DB_URI
      : process.env.REMOTE_DB_URI,
  collection: "sessions",
});
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());

app.use(cors({ origin: true, credentials: true }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: session_secret,
    store: store,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax", // Helps with CSRF protection
    },
  })
);

app.use("/api/v1", rootRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use(notFoundMiddleware);
app.use(expressErrorHandler);

module.exports = app;
