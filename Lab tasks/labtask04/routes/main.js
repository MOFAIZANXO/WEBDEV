const express = require('express');
const router = express.Router();
const products = require('../models/products');

router.get('/', (req, res) => {
    res.render('index', { products, user: req.session.user });
});

router.get('/products', (req, res) => {
    res.render('products', { products, user: req.session.user, csrfToken: req.csrfToken() });
});

router.get('/about', (req, res) => {
    res.render('about', { user: req.session.user });
});

module.exports = router;