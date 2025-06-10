const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'owner', 'admin'],
    default: 'customer'
  },
  businessName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Customer Profile Features
  profile: {
    bio: {
      type: String,
      maxlength: 500
    },
    favoriteFood: String,
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
    }],
    location: {
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },

  // Favorites System
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck'
  }],

  // User Preferences & Settings
  preferences: {
    notifications: {
      pushEnabled: {
        type: Boolean,
        default: true
      },
      emailEnabled: {
        type: Boolean,
        default: true
      },
      favoriteUpdates: {
        type: Boolean,
        default: true
      },
      nearbyTrucks: {
        type: Boolean,
        default: true
      }
    },
    location: {
      shareLocation: {
        type: Boolean,
        default: true
      },
      defaultRadius: {
        type: Number,
        default: 15
      },
      autoDetectLocation: {
        type: Boolean,
        default: true
      }
    },
    display: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      language: {
        type: String,
        default: 'en'
      },
      showDistance: {
        type: Boolean,
        default: true
      },
      showPrices: {
        type: Boolean,
        default: true
      }
    }
  },

  // Activity Tracking
  activity: {
    lastLogin: {
      type: Date,
      default: Date.now
    },
    totalVisits: {
      type: Number,
      default: 1
    },
    trucksVisited: [{
      truckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodTruck'
      },
      visitDate: {
        type: Date,
        default: Date.now
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String
    }],
    searchHistory: [{
      query: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Verification & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Social Login
  socialLogins: {
    google: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'favorites.foodTrucks.truckId': 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get favorite truck IDs
userSchema.methods.getFavoriteTruckIds = function() {
  return this.favorites.map(favorite => favorite.toString());
};

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 