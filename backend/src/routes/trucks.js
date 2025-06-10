const express = require('express');
const router = express.Router();
const Truck = require('../models/Truck');
const { auth, authorize } = require('../middleware/auth');

// Get all trucks
router.get('/', async (req, res) => {
  try {
    const { cuisine, search, sort } = req.query;
    let query = { isActive: true };

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = cuisine;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'rating') {
      sortObj = { 'rating.average': -1 };
    } else if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    }

    const trucks = await Truck.find(query)
      .sort(sortObj)
      .populate('owner', 'name businessName');

    res.json(trucks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trucks' });
  }
});

// Get truck by ID
router.get('/:id', async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id)
      .populate('owner', 'name businessName phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    res.json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching truck' });
  }
});

// Create new truck
router.post('/', auth, authorize('owner'), async (req, res) => {
  try {
    const truck = new Truck({
      ...req.body,
      owner: req.user._id
    });

    await truck.save();
    res.status(201).json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Error creating truck' });
  }
});

// Update truck
router.put('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    if (truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTruck = await Truck.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedTruck);
  } catch (error) {
    res.status(500).json({ message: 'Error updating truck' });
  }
});

// Delete truck
router.delete('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    if (truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await truck.remove();
    res.json({ message: 'Truck deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting truck' });
  }
});

// Get owner's trucks
router.get('/owner/trucks', auth, authorize('owner'), async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user._id });
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trucks' });
  }
});

// Update truck location
router.put('/:id/location', auth, authorize('owner'), async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    if (truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    truck.location = {
      current: {
        type: 'Point',
        coordinates
      },
      address
    };

    await truck.save();
    res.json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Error updating location' });
  }
});

// Update truck schedule
router.put('/:id/schedule', auth, authorize('owner'), async (req, res) => {
  try {
    const { schedule } = req.body;
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    if (truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    truck.schedule = schedule;
    await truck.save();

    res.json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule' });
  }
});

module.exports = router; 