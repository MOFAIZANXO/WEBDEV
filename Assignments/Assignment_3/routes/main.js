const express = require('express');
const router = express.Router();

const products = [
    { id: 1, name: 'Autumn Dress', price: 250, image: 'https://wwd.com/wp-content/uploads/2022/02/Roksanda_RTW_Fall_2022_GG_1153.jpg' },
    { id: 2, name: 'Spring Gown', price: 350, image: 'https://wwd.com/wp-content/uploads/2023/11/ROKSANDA-X-PULITZER-Ashkan-Mortezapour.jpg?w=1000&h=563&crop=1&resize=1000%2C563' },
    { id: 3, name: 'Summer Top', price: 150, image: 'https://wwd.com/wp-content/uploads/2024/04/WWD_Archive_Paywall_Image.jpeg' }
];

router.get('/', (req, res) => {
    res.render('index', { products, user: req.session.user });
});

router.get('/products', (req, res) => {
    res.render('products', { products, user: req.session.user });
});

router.get('/about', (req, res) => {
    res.render('about', { user: req.session.user });
});

module.exports = router;