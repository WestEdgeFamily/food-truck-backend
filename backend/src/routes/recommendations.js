const express = require('express');
const router = express.Router();
const Truck = require('../models/Truck');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get personalized recommendations
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favoriteTruckIds = user.getFavoriteTruckIds();

    // Get trucks based on user's favorite cuisines
    const favoriteTrucks = await Truck.find({
      _id: { $in: favoriteTruckIds }
    });

    const favoriteCuisines = [...new Set(favoriteTrucks.map(truck => truck.cuisine))];

    // Find trucks with similar cuisines
    const recommendations = await Truck.find({
      _id: { $nin: favoriteTruckIds },
      cuisine: { $in: favoriteCuisines },
      isActive: true
    })
    .sort({ 'rating.average': -1 })
    .limit(10);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

// Get nearby trucks
router.get('/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, radius = 15 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }

    const nearbyTrucks = await Truck.find({
      isActive: true,
      'location.current': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert miles to meters
        }
      }
    })
    .sort({ 'rating.average': -1 })
    .limit(20);

    res.json(nearbyTrucks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nearby trucks' });
  }
});

// Get trending trucks
router.get('/trending', async (req, res) => {
  try {
    const trendingTrucks = await Truck.find({
      isActive: true,
      'rating.count': { $gt: 0 }
    })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(10);

    res.json(trendingTrucks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending trucks' });
  }
});

// Get new trucks
router.get('/new', async (req, res) => {
  try {
    const newTrucks = await Truck.find({
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(10);

    res.json(newTrucks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new trucks' });
  }
});

module.exports = router; 