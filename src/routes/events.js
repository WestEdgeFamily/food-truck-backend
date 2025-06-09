   // backend/src/routes/events.js
   const express = require('express');
   const router = express.Router();

   // Placeholder route
   router.get('/', (req, res) => {
     res.json({ message: 'Events route is working!' });
   });

   module.exports = router;
