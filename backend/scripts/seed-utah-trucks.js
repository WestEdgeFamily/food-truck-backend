const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Truck = require('../src/models/Truck');

const utahTrucks = [
  {
    name: 'Taco Cartel',
    cuisine: 'Mexican',
    description: 'Authentic Mexican street food with a modern twist. Our tacos, burritos, and quesadillas are made with fresh, locally-sourced ingredients.',
    menu: [
      {
        name: 'Street Tacos',
        description: 'Three corn tortillas with your choice of meat, topped with onions, cilantro, and lime',
        price: 8.99,
        category: 'Tacos'
      },
      {
        name: 'Carne Asada Burrito',
        description: 'Grilled steak, rice, beans, cheese, and salsa wrapped in a flour tortilla',
        price: 10.99,
        category: 'Burritos'
      },
      {
        name: 'Quesadilla',
        description: 'Grilled flour tortilla with cheese and your choice of meat',
        price: 7.99,
        category: 'Quesadillas'
      }
    ],
    location: {
      current: {
        type: 'Point',
        coordinates: [-111.8910, 40.7608] // Salt Lake City coordinates
      },
      address: {
        street: '123 Main St',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84101'
      }
    },
    schedule: [
      {
        day: 'Monday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Tuesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Wednesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Thursday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Friday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Saturday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Sunday',
        openTime: '12:00',
        closeTime: '18:00',
        isOpen: true
      }
    ]
  },
  {
    name: 'Waffle Love',
    cuisine: 'Desserts',
    description: 'Belgian-style liege waffles with unique toppings and combinations. A sweet treat that will make your day!',
    menu: [
      {
        name: 'Classic Liege Waffle',
        description: 'Traditional Belgian waffle with pearl sugar',
        price: 5.99,
        category: 'Classics'
      },
      {
        name: 'Nutella Dream',
        description: 'Waffle topped with Nutella, strawberries, and whipped cream',
        price: 8.99,
        category: 'Specialties'
      },
      {
        name: 'S\'mores Waffle',
        description: 'Waffle with chocolate, marshmallows, and graham crackers',
        price: 7.99,
        category: 'Specialties'
      }
    ],
    location: {
      current: {
        type: 'Point',
        coordinates: [-111.8910, 40.7608]
      },
      address: {
        street: '456 State St',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84111'
      }
    },
    schedule: [
      {
        day: 'Monday',
        openTime: '08:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Tuesday',
        openTime: '08:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Wednesday',
        openTime: '08:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Thursday',
        openTime: '08:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Friday',
        openTime: '08:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Saturday',
        openTime: '08:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Sunday',
        openTime: '08:00',
        closeTime: '20:00',
        isOpen: true
      }
    ]
  },
  {
    name: 'Sushi on Wheels',
    cuisine: 'Japanese',
    description: 'Fresh and creative sushi rolls made with the finest ingredients. Experience Japanese cuisine on the go!',
    menu: [
      {
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber roll',
        price: 8.99,
        category: 'Classic Rolls'
      },
      {
        name: 'Spicy Tuna Roll',
        description: 'Tuna and spicy mayo roll',
        price: 9.99,
        category: 'Classic Rolls'
      },
      {
        name: 'Dragon Roll',
        description: 'Tempura shrimp, avocado, and eel sauce',
        price: 12.99,
        category: 'Specialty Rolls'
      }
    ],
    location: {
      current: {
        type: 'Point',
        coordinates: [-111.8910, 40.7608]
      },
      address: {
        street: '789 Market St',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84102'
      }
    },
    schedule: [
      {
        day: 'Monday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Tuesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Wednesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Thursday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Friday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Saturday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Sunday',
        openTime: '12:00',
        closeTime: '18:00',
        isOpen: true
      }
    ]
  },
  {
    name: 'The Burger Bus',
    cuisine: 'American',
    description: 'Gourmet burgers made with locally-sourced beef and fresh ingredients. A classic American experience!',
    menu: [
      {
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with cheese, lettuce, tomato, and special sauce',
        price: 9.99,
        category: 'Burgers'
      },
      {
        name: 'Bacon Avocado Burger',
        description: 'Beef patty with bacon, avocado, and chipotle mayo',
        price: 11.99,
        category: 'Burgers'
      },
      {
        name: 'Truffle Fries',
        description: 'Crispy fries with truffle oil and parmesan',
        price: 4.99,
        category: 'Sides'
      }
    ],
    location: {
      current: {
        type: 'Point',
        coordinates: [-111.8910, 40.7608]
      },
      address: {
        street: '321 Food Truck Lane',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84103'
      }
    },
    schedule: [
      {
        day: 'Monday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Tuesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Wednesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Thursday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Friday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Saturday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Sunday',
        openTime: '12:00',
        closeTime: '18:00',
        isOpen: true
      }
    ]
  },
  {
    name: 'Thai Street Eats',
    cuisine: 'Thai',
    description: 'Authentic Thai street food with bold flavors and fresh ingredients. Experience the taste of Thailand!',
    menu: [
      {
        name: 'Pad Thai',
        description: 'Stir-fried rice noodles with tofu, peanuts, and tamarind sauce',
        price: 10.99,
        category: 'Noodles'
      },
      {
        name: 'Green Curry',
        description: 'Coconut curry with vegetables and your choice of protein',
        price: 11.99,
        category: 'Curries'
      },
      {
        name: 'Spring Rolls',
        description: 'Fresh vegetables and herbs wrapped in rice paper',
        price: 6.99,
        category: 'Appetizers'
      }
    ],
    location: {
      current: {
        type: 'Point',
        coordinates: [-111.8910, 40.7608]
      },
      address: {
        street: '654 Asian Ave',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84104'
      }
    },
    schedule: [
      {
        day: 'Monday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Tuesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Wednesday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Thursday',
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true
      },
      {
        day: 'Friday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Saturday',
        openTime: '11:00',
        closeTime: '22:00',
        isOpen: true
      },
      {
        day: 'Sunday',
        openTime: '12:00',
        closeTime: '18:00',
        isOpen: true
      }
    ]
  }
];

async function seedTrucks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create owner accounts
    const owners = await Promise.all(
      utahTrucks.map(async (truck, index) => {
        const owner = new User({
          name: `Owner ${index + 1}`,
          email: `owner${index + 1}@example.com`,
          password: 'password123',
          phone: '(801) 555-0000',
          role: 'owner',
          businessName: truck.name
        });

        await owner.save();
        return owner;
      })
    );

    // Create trucks
    await Promise.all(
      utahTrucks.map(async (truckData, index) => {
        const truck = new Truck({
          ...truckData,
          owner: owners[index]._id
        });

        await truck.save();
        console.log(`Created truck: ${truck.name}`);
      })
    );

    console.log('\nSeed completed successfully!');
    console.log('\nOwner Login Credentials:');
    owners.forEach((owner, index) => {
      console.log(`\nTruck: ${utahTrucks[index].name}`);
      console.log(`Email: ${owner.email}`);
      console.log('Password: password123');
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  seedTrucks();
}

module.exports = { seedTrucks };