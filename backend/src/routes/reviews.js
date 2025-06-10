const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Truck = require('../models/Truck');
const { auth } = require('../middleware/auth');

// Get reviews for a truck
router.get('/truck/:truckId', async (req, res) => {
  try {
    const reviews = await Review.find({ truck: req.params.truckId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get user's reviews
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('truck', 'name cuisine')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { truckId, rating, comment, images } = req.body;

    // Check if user has already reviewed this truck
    const existingReview = await Review.findOne({
      user: req.user._id,
      truck: truckId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this truck' });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      truck: truckId,
      rating,
      comment,
      images
    });

    await review.save();

    // Update truck rating
    const truck = await Truck.findById(truckId);
    await truck.updateRating(rating);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { rating, comment, images } = req.body;

    // Update truck rating if rating changed
    if (rating !== review.rating) {
      const truck = await Truck.findById(review.truck);
      const oldRating = review.rating;
      const newRating = rating;

      // Remove old rating and add new one
      truck.rating.average = ((truck.rating.average * truck.rating.count) - oldRating + newRating) / truck.rating.count;
      await truck.save();
    }

    review.rating = rating;
    review.comment = comment;
    review.images = images;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update truck rating
    const truck = await Truck.findById(review.truck);
    const oldRating = review.rating;

    if (truck.rating.count > 1) {
      truck.rating.average = ((truck.rating.average * truck.rating.count) - oldRating) / (truck.rating.count - 1);
      truck.rating.count -= 1;
    } else {
      truck.rating.average = 0;
      truck.rating.count = 0;
    }

    await truck.save();
    await review.remove();

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Like/Unlike review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.toggleLike(req.user._id);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like' });
  }
});

module.exports = router; 