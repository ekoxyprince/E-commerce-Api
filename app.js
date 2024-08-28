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
const corsOption = require("./config/corsOptions");
const logger = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { allowedOrigin, session_secret, database_uri } = require("./config");

const expressErrorHandler = require("./middlewares/errorhandler");
const notFoundMiddleware = require("./middlewares/notfound");

const app = express();
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://www.urbantrov.com.ng",
      /\.urbantrov\.com\.ng$/, 
    ];

    if (allowedOrigins.some((pattern) => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: "Content-Type,Authorization",
};


app.use(cors(corsOptions));

app.use("/api/v1", rootRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use(notFoundMiddleware);
app.use(expressErrorHandler);

module.exports = app;
