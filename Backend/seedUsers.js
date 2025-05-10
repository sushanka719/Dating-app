import mongoose from "mongoose";
import User from "./src/models/user.js"; // Adjust the path if needed
import { faker } from '@faker-js/faker'; // Updated import for faker

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb+srv://sushanka:EDLxvhfUXRjtNGnh@cluster0.iampbnw.mongodb.net/mern-blog");

        // Array to hold user data
        const users = [];

        // Generate 50 fake users
        for (let i = 0; i < 50; i++) {
            const user = {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(8), // Just a placeholder password, make sure to hash it in real app
                age: faker.number.int({ min: 18, max: 60 }),
                gender: faker.helpers.arrayElement(["male", "female", "non-binary", "other"]),
                interestedIn: faker.helpers.arrayElement(["male", "female", "everyone"]),
                bio: faker.lorem.sentence(),
                profilePics: [faker.image.avatar()],
                location: {
                    city: faker.location.city(),
                    country: faker.location.country(),
                    coordinates: {
                        lat: faker.location.latitude(),
                        lng: faker.location.longitude(),
                    },
                },
                interests: faker.helpers.arrayElements(["music", "sports", "travel", "reading", "movies"], 3),
                preferences: {
                    minAge: faker.number.int({ min: 18, max: 25 }),
                    maxAge: faker.number.int({ min: 30, max: 50 }),
                    maxDistance: 50, // 50 km
                },
                isVerified: faker.datatype.boolean(true),
                lastActive: faker.date.recent(),
            };
            users.push(user);
        }

        // Insert all the generated users into the database
        await User.insertMany(users);
        console.log("Seeded 50 users successfully!");
    } catch (error) {
        console.error("Error seeding users:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

// Run the seeding function
// seedUsers();
