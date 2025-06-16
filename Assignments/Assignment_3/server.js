const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const mainRoutes = require('./routes/main');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Routes
app.use('/', mainRoutes);
app.use('/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});