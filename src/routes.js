
const express = require('express');
const splitRoutes = require('./modules/split/split.route');

const router = express.Router();

// === MODULE ROUTES ===
router.use('/split', splitRoutes);


// router.use('/auth', authRoutes);
// router.use('/wallets', walletRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/transactions', transactionRoutes);
// router.use('/savings', savingsRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/users', userRoutes);

module.exports = router;