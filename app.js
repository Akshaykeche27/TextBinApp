if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo").default
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const path = require("path")

const indexRoute = require("./routes/index")

const app = express()
const PORT = process.env.PORT || 8080

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URL)
  console.log("MongoDB connected")
}

connectDB().catch(err => console.log(err))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
      ttl: 60 * 60
    }),
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
)

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

app.use("/", indexRoute)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})