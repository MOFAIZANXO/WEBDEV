const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth'); // Updated path
const Order = require('../models/Order'); // Updated path

// Get user's orders
router.get('/my-orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user._id })
            .sort({ orderDate: -1 });
        res.render('orders', { 
            orders,
            user: req.session.user,
            errors: [],
            title: 'My Orders'
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Orders Error',
            message: 'Error fetching orders',
            error: { status: 500 }
        });
    }
});

module.exports = router;