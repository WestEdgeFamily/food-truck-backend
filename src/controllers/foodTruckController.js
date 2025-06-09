const FoodTruck = require('../models/FoodTruck');
const User = require('../models/User');

// @desc    Get food truck details for the logged-in owner
// @route   GET /api/foodtrucks/my-truck
// @access  Private (Owner only)
const getMyTruck = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        let foodTruck = await FoodTruck.findOne({ owner: userId });
        if (!foodTruck) {
            // Create a new food truck if none exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            foodTruck = await FoodTruck.create({
                owner: userId,
                name: user.businessName || 'My Food Truck',
                isActive: false
            });
            console.log('Created new food truck for user:', userId);
        }
        res.json(foodTruck);
    } catch (error) {
        console.error('Error fetching food truck:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new food truck
// @route   POST /api/foodtrucks
// @access  Private (Owner only)
const createFoodTruck = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const foodTruck = new FoodTruck({
            ...req.body,
            owner: userId
        });
        await foodTruck.save();
        res.status(201).json(foodTruck);
    } catch (error) {
        console.error('Create food truck error:', error);
        res.status(500).json({ message: 'Error creating food truck', error: error.message });
    }
};

// @desc    Get all food trucks with optional filters
// @route   GET /api/foodtrucks
// @access  Public
const getFoodTrucks = async (req, res) => {
    try {
        const { lat, lng, radius = 5000, cuisine } = req.query;
        
        let query = {};
        
        // Add location filter if coordinates are provided
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            };
        }

        // Add cuisine filter if provided
        if (cuisine) {
            query.cuisineType = cuisine;
        }

        const foodTrucks = await FoodTruck.find(query)
            .populate('owner', 'name email businessName')
            .sort('-createdAt');

        res.json(foodTrucks);
    } catch (error) {
        console.error('Get food trucks error:', error);
        res.status(500).json({ message: 'Error fetching food trucks', error: error.message });
    }
};

// @desc    Get a single food truck by ID
// @route   GET /api/foodtrucks/:id
// @access  Public
const getFoodTruck = async (req, res) => {
    try {
        const foodTruck = await FoodTruck.findById(req.params.id)
            .populate('owner', 'name email businessName');
        
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }
        
        res.json(foodTruck);
    } catch (error) {
        console.error('Get food truck error:', error);
        res.status(500).json({ message: 'Error fetching food truck', error: error.message });
    }
};

// @desc    Update food truck details
// @route   PUT /api/foodtrucks/:id
// @access  Private (Owner only)
const updateFoodTruck = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const foodTruck = await FoodTruck.findOneAndUpdate(
            { _id: req.params.id, owner: userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        res.json(foodTruck);
    } catch (error) {
        console.error('Update food truck error:', error);
        res.status(500).json({ message: 'Error updating food truck', error: error.message });
    }
};

// @desc    Delete food truck
// @route   DELETE /api/foodtrucks/:id
// @access  Private (Owner only)
const deleteFoodTruck = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const foodTruck = await FoodTruck.findOneAndDelete({
            _id: req.params.id,
            owner: userId
        });

        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        res.json({ message: 'Food truck deleted successfully' });
    } catch (error) {
        console.error('Delete food truck error:', error);
        res.status(500).json({ message: 'Error deleting food truck', error: error.message });
    }
};

// @desc    Update food truck location (Enhanced for social media tracking)
// @route   PUT /api/foodtrucks/:id/location
// @access  Private (Owner only)
const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, city, state, source, notes } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('updateLocation called with:', { latitude, longitude, userId, source });

        // Validate inputs
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        let foodTruck = await FoodTruck.findOne({ owner: userId });
        
        if (!foodTruck) {
            // Create new food truck if one doesn't exist
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            foodTruck = new FoodTruck({
                owner: userId,
                name: user.businessName || 'My Food Truck',
                businessName: user.businessName || 'My Food Truck',
                phoneNumber: user.phoneNumber || '',
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                    address: address || '',
                    city: city || '',
                    state: state || '',
                    source: source || 'owner',
                    confidence: 'high',
                    notes: notes || '',
                    lastUpdated: new Date()
                },
                cuisineType: 'American',
                foodTypes: [],
                businessHours: [],
                menu: [],
                isActive: false
            });
        }

        // Save current location to history before updating
        if (foodTruck.location && foodTruck.location.coordinates[0] !== 0 && foodTruck.location.coordinates[1] !== 0) {
            foodTruck.locationHistory.push({
                coordinates: foodTruck.location.coordinates,
                address: foodTruck.location.address,
                city: foodTruck.location.city,
                state: foodTruck.location.state,
                source: foodTruck.location.source,
                confidence: foodTruck.location.confidence,
                notes: foodTruck.location.notes,
                timestamp: foodTruck.location.lastUpdated
            });
        }

        // Update current location
        foodTruck.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
            address: address || foodTruck.location.address || '',
            city: city || foodTruck.location.city || '',
            state: state || foodTruck.location.state || '',
            source: source || 'owner',
            confidence: 'high',
            notes: notes || '',
            lastUpdated: new Date()
        };

        await foodTruck.save({ validateModifiedOnly: true });
        console.log('Location updated successfully for user:', userId);
        res.json({ message: 'Location updated successfully', foodTruck });
    } catch (error) {
        console.error('Update location error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Invalid location data', error: error.message });
        } else if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid data format', error: error.message });
        } else {
            res.status(500).json({ message: 'Error updating location', error: error.message });
        }
    }
};

// @desc    Customer reports food truck location
// @route   POST /api/foodtrucks/:id/report-location
// @access  Private (Customer only)
const reportLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, city, state, notes } = req.body;
        const { id: truckId } = req.params;
        const userId = req.user?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findById(truckId);
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        // Add location report to history
        foodTruck.locationHistory.push({
            coordinates: [longitude, latitude],
            address: address || '',
            city: city || '',
            state: state || '',
            source: 'customer_report',
            confidence: 'medium',
            notes: notes || '',
            timestamp: new Date()
        });

        await foodTruck.save();
        res.json({ message: 'Location report added successfully' });
    } catch (error) {
        console.error('Report location error:', error);
        res.status(500).json({ message: 'Error reporting location', error: error.message });
    }
};

// @desc    Update business hours
// @route   PUT /api/foodtrucks/:id/hours
// @access  Private (Owner only)
const updateHours = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findOneAndUpdate(
            { _id: req.params.id, owner: userId },
            { businessHours: req.body.businessHours },
            { new: true, runValidators: true }
        );

        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        res.json(foodTruck);
    } catch (error) {
        console.error('Update hours error:', error);
        res.status(500).json({ message: 'Error updating business hours', error: error.message });
    }
};

// @desc    Update food types
// @route   PUT /api/foodtrucks/:id/foodtypes
// @access  Private (Owner only)
const updateFoodTypes = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findOneAndUpdate(
            { _id: req.params.id, owner: userId },
            { foodTypes: req.body.foodTypes },
            { new: true, runValidators: true }
        );

        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        res.json(foodTruck);
    } catch (error) {
        console.error('Update food types error:', error);
        res.status(500).json({ message: 'Error updating food types', error: error.message });
    }
};

// @desc    Add rating to food truck
// @route   POST /api/foodtrucks/:id/rating
// @access  Private
const addRating = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findById(req.params.id);
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        // Add new rating
        foodTruck.ratings.push({
            user: userId,
            rating,
            comment,
            date: new Date()
        });

        // Update average rating
        const totalRatings = foodTruck.ratings.length;
        const sumRatings = foodTruck.ratings.reduce((sum, r) => sum + r.rating, 0);
        foodTruck.averageRating = sumRatings / totalRatings;

        await foodTruck.save();
        res.json(foodTruck);
    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({ message: 'Error adding rating', error: error.message });
    }
};

// @desc    Add menu item
// @route   POST /api/foodtrucks/:id/menu
// @access  Private (Owner only)
const addMenuItem = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findOne({ _id: req.params.id, owner: userId });
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        foodTruck.menu.push(req.body);
        await foodTruck.save();
        res.json(foodTruck);
    } catch (error) {
        console.error('Add menu item error:', error);
        res.status(500).json({ message: 'Error adding menu item', error: error.message });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/foodtrucks/:id/menu/:itemId
// @access  Private (Owner only)
const deleteMenuItem = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findOne({ _id: req.params.id, owner: userId });
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        foodTruck.menu = foodTruck.menu.filter(item => item._id.toString() !== req.params.itemId);
        await foodTruck.save();
        res.json(foodTruck);
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
};

// @desc    Get available filters
// @route   GET /api/foodtrucks/filters
// @access  Public
const getFilters = async (req, res) => {
    try {
        const cuisineTypes = await FoodTruck.distinct('cuisineType');
        const foodTypes = await FoodTruck.distinct('foodTypes');
        
        res.json({
            cuisineTypes: cuisineTypes.filter(Boolean),
            foodTypes: foodTypes.filter(Boolean)
        });
    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ message: 'Error getting filters', error: error.message });
    }
};

// @desc    Search food trucks
// @route   GET /api/foodtrucks/search
// @access  Public
const searchFoodTrucks = async (req, res) => {
    try {
        const { query, cuisineType, foodType, isOpen } = req.query;
        
        let searchQuery = {};
        
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (cuisineType) {
            searchQuery.cuisineType = cuisineType;
        }
        
        if (foodType) {
            searchQuery.foodTypes = foodType;
        }
        
        if (isOpen === 'true') {
            searchQuery.isActive = true;
        }

        const foodTrucks = await FoodTruck.find(searchQuery)
            .populate('owner', 'name email businessName')
            .sort('-createdAt');

        res.json(foodTrucks);
    } catch (error) {
        console.error('Search food trucks error:', error);
        res.status(500).json({ message: 'Error searching food trucks', error: error.message });
    }
};

// @desc    Update social media settings
// @route   PUT /api/foodtrucks/my-truck/social-media
// @access  Private (Owner only)
const updateSocialMedia = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findOne({ owner: userId });
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        foodTruck.socialMedia = req.body;
        await foodTruck.save();
        res.json(foodTruck);
    } catch (error) {
        console.error('Update social media error:', error);
        res.status(500).json({ message: 'Error updating social media settings', error: error.message });
    }
};

// @desc    Check in at location
// @route   POST /api/foodtrucks/my-truck/checkin
// @access  Private (Owner only)
const checkIn = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const foodTruck = await FoodTruck.findOne({ owner: userId });
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        const { latitude, longitude, address, city, state, notes, autoPostToSocial } = req.body;

        // Update location
        foodTruck.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
            address,
            city,
            state,
            source: 'checkin',
            confidence: 'high',
            notes,
            lastUpdated: new Date()
        };

        // Add to location history
        foodTruck.locationHistory.push({
            coordinates: [longitude, latitude],
            address,
            city,
            state,
            source: 'checkin',
            confidence: 'high',
            notes,
            timestamp: new Date()
        });

        await foodTruck.save();

        // Emit real-time update
        const io = req.app.get('socketio');
        if (io) {
            io.to('customers').emit('truck_location_updated', {
                truckId: foodTruck._id,
                location: foodTruck.location,
                timestamp: new Date(),
                source: 'checkin',
                truckName: foodTruck.name
            });
        }

        res.json({ message: 'Check-in successful', foodTruck });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Error checking in', error: error.message });
    }
};

// @desc    Get location history
// @route   GET /api/foodtrucks/:id/location-history
// @access  Public
const getLocationHistory = async (req, res) => {
    try {
        const foodTruck = await FoodTruck.findById(req.params.id);
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        const limit = parseInt(req.query.limit) || 10;
        const history = foodTruck.locationHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);

        res.json({ history });
    } catch (error) {
        console.error('Get location history error:', error);
        res.status(500).json({ message: 'Error getting location history', error: error.message });
    }
};

// @desc    Admin update location
// @route   PUT /api/foodtrucks/:id/admin-location
// @access  Private (Admin only)
const adminUpdateLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, city, state, source, notes } = req.body;
        
        const foodTruck = await FoodTruck.findById(req.params.id);
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        // Save current location to history
        if (foodTruck.location && foodTruck.location.coordinates[0] !== 0 && foodTruck.location.coordinates[1] !== 0) {
            foodTruck.locationHistory.push({
                coordinates: foodTruck.location.coordinates,
                address: foodTruck.location.address,
                city: foodTruck.location.city,
                state: foodTruck.location.state,
                source: foodTruck.location.source,
                confidence: foodTruck.location.confidence,
                notes: foodTruck.location.notes,
                timestamp: foodTruck.location.lastUpdated
            });
        }

        // Update location
        foodTruck.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
            address,
            city,
            state,
            source: source || 'admin',
            confidence: 'high',
            notes,
            lastUpdated: new Date()
        };

        await foodTruck.save();

        // Emit real-time update
        const io = req.app.get('socketio');
        if (io) {
            io.to('customers').emit('truck_location_updated', {
                truckId: foodTruck._id,
                location: foodTruck.location,
                timestamp: new Date(),
                source: 'admin',
                truckName: foodTruck.name
            });
        }

        res.json({ message: 'Location updated successfully', foodTruck });
    } catch (error) {
        console.error('Admin update location error:', error);
        res.status(500).json({ message: 'Error updating location', error: error.message });
    }
};

module.exports = {
    getMyTruck,
    createFoodTruck,
    getFoodTrucks,
    getFoodTruck,
    updateFoodTruck,
    deleteFoodTruck,
    updateLocation,
    updateHours,
    updateFoodTypes,
    addRating,
    addMenuItem,
    deleteMenuItem,
    getFilters,
    searchFoodTrucks,
    reportLocation,
    updateSocialMedia,
    checkIn,
    adminUpdateLocation,
    getLocationHistory
}; 
