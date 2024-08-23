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
const corsOptions = require("./config/corsOptions");
const logger = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { session_secret, database_uri } = require("./config");
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
const store = new MongoDBStore({
  uri: database_uri,
  collection: "sessions",
});
app.set("trust proxy", 1);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());
const allowedOrigin = "https://www.urbantrov.com.ng";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: session_secret,
    store: store,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only set to true if your frontend is served over HTTPS
      sameSite: "Lax", // Can be set to 'Strict' or 'None' depending on your requirements
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
