const express = require('express');
   const { body, validationResult } = require('express-validator');
   const router = express.Router();
   const User = require('../models/User');

   router.get('/login', (req, res) => {
       res.render('login', { user: req.session.user, errors: [] });
   });

   router.post('/login', [
       body('email').isEmail().withMessage('Please enter a valid email'),
       body('password').notEmpty().withMessage('Password is required')
   ], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.render('login', { errors: errors.array(), user: req.session.user });
       }

       const { email, password } = req.body;
       try {
           const user = await User.findOne({ email });
           if (!user || !(await user.comparePassword(password))) {
               return res.render('login', { errors: [{ msg: 'Invalid email or password' }], user: req.session.user });
           }
           
           req.session.user = user;
           res.redirect('/');
       } catch (error) {
           res.render('login', { errors: [{ msg: 'Server error' }], user: req.session.user });
       }
   });

   router.get('/signup', (req, res) => {
       res.render('signup', { errors: [], user: req.session.user });
   });

   router.post('/signup', [
       body('firstName').notEmpty().withMessage('First name is required'),
       body('lastName').notEmpty().withMessage('Last name is required'),
       body('email').isEmail().withMessage('Please enter a valid email'),
       body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
   ], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.render('signup', { errors: errors.array(), user: req.session.user });
       }

       const { firstName, lastName, email, password } = req.body;
       try {
           const existingUser = await User.findOne({ email });
           if (existingUser) {
               return res.render('signup', { errors: [{ msg: 'Email already exists' }], user: req.session.user });
           }

           const user = new User({ firstName, lastName, email, password });
           await user.save();
           req.session.user = user;
           res.redirect('/');
       } catch (error) {
           res.render('signup', { errors: [{ msg: 'Registration failed' }], user: req.session.user });
       }
   });

   router.get('/logout', (req, res) => {
       req.session.destroy(() => {
           res.redirect('/');
       });
   });

   module.exports = router;