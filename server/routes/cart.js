const router = require('express').Router();
// Cart is managed client-side in localStorage/context for MERN
// This route is a placeholder for future server-side cart sync
router.get('/', (req, res) => res.json({ message: 'Cart managed client-side' }));
module.exports = router;
