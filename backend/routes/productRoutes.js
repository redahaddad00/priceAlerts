const express = require('express');
const { getProducts, addProduct, removeProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getProducts).post(protect, addProduct);
router.route('/:id').delete(protect, removeProduct);

module.exports = router;
