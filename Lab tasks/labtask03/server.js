const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const mainRoutes = require('./routes/main');
const orderRoutes = require('./routes/orders');
const Order = require('./models/Order');
const { isAuthenticated } = require('./middleware/auth');
const products = require('./models/products');
const csrf = require('csurf');
const csrfProtection = csrf();



// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS and layouts configuration
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');  // Make sure you have layouts/main.ejs

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// CSRF protection
app.use(csrfProtection);

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
        session: req.session,
        body: req.body,
        user: req.session.user
    });
    next();
});

// Make user and title available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.title = 'Roksanda';
    next();
});

// Routes
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/', orderRoutes);

// Add to Cart (GET handler for user-friendly error)
app.get('/cart/add', (req, res) => {
    res.status(405).render('error', {
        title: 'Invalid Request',
        message: 'Please use the Add to Cart button on the products page.',
        error: { status: 405 },
        user: req.session.user
    });
});

// Add to Cart (creates or updates an order)
app.post('/cart/add', isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.body;
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) {
            return res.status(404).render('error', {
                title: 'Product Not Found',
                message: 'The product you are trying to add does not exist.',
                error: { status: 404 },
                user: req.session.user
            });
        }
        // Check for existing order for this user and product
        let order = await Order.findOne({
            user: req.session.user._id,
            'items.productId': product.id
        });
        if (order) {
            // Increment quantity and totalAmount
            await Order.updateOne(
                { _id: order._id, 'items.productId': product.id },
                { $inc: { 'items.$.quantity': 1, totalAmount: product.price } }
            );
        } else {
            // Create new order
            order = new Order({
                user: req.session.user._id,
                items: [{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                }],
                totalAmount: product.price
            });
            await order.save();
        }
        res.redirect('/my-orders');
    } catch (err) {
        console.error('Error in /cart/add:', err);
        res.status(500).render('error', {
            title: 'Order Error',
            message: 'Could not add to cart. Please try again.',
            error: { status: 500 },
            user: req.session.user
        });
    }
});

// Remove order
app.post('/orders/remove/:orderId', isAuthenticated, async (req, res) => {
    try {
        await Order.deleteOne({ _id: req.params.orderId, user: req.session.user._id });
        res.redirect('/my-orders');
    } catch (err) {
        res.status(500).send('Could not remove order');
    }
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'Page not found',
        error: { status: 404 },
        user: req.session.user
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        title: 'Error',
        message: err.message || 'Something went wrong!',
        error: { status: err.status || 500 },
        user: req.session.user
    });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});