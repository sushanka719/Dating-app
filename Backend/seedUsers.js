import mongoose from "mongoose";
import User from "./src/models/user.js"; // Adjust the path if needed
import { faker } from '@faker-js/faker';

const seedUsers = async () => {
    try {
        await mongoose.connect("mongodb+srv://sushanka:EDLxvhfUXRjtNGnh@cluster0.iampbnw.mongodb.net/mern-blog");

        const users = [];

        for (let i = 0; i < 500; i++) {
            const minAge = faker.number.int({ min: 18, max: 30 });
            const maxAge = faker.number.int({ min: minAge + 1, max: 60 });

            const user = {
                name: faker.person.fullName(),
                nickName: faker.person.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(8), // In real app, hash before saving
                age: faker.number.int({ min: 18, max: 60 }),
                gender: faker.helpers.arrayElement(["male", "female", "non-binary", "other"]),
                interestedIn: faker.helpers.arrayElement(["male", "female", "everyone"]),
                lookingfor: faker.helpers.arrayElement(["date", "bff"]),
                bio: faker.lorem.sentence(),
                profilePics: [faker.image.avatar()],
                location: {
                    city: faker.location.city(),
                    country: faker.location.country(),
                    coordinates: {
                        lat: parseFloat(faker.location.latitude()),
                        lng: parseFloat(faker.location.longitude()),
                    },
                },
                interests: faker.helpers.arrayElements(
                    ["music", "sports", "travel", "reading", "movies", "cooking", "fitness", "art", "tech", "nature"],
                    3
                ),
                matches: [],
                likes: [],
                dislikes: [],
                blockedList: [],
                preferences: {
                    minAge,
                    maxAge,
                    maxDistance: faker.number.int({ min: 5, max: 1000 }),
                },
                isVerified: faker.datatype.boolean(),
                isOnboarded: faker.datatype.boolean(),
                lastActive: faker.date.recent(),
                verificationToken: faker.string.uuid(),
                verificationTokenExpiresAt: faker.date.soon({ days: 7 }),
                snoozeMode: faker.datatype.boolean(),

                job: faker.person.jobTitle(),
                education: faker.helpers.arrayElement(["High School", "Bachelor's", "Master's", "PhD", "Other"]),
                height: faker.number.int({ min: 150, max: 200 }), // height in cm
                drinking: faker.helpers.arrayElement(["yes", "no", "occasionally"]),
                smoking: faker.helpers.arrayElement(["yes", "no", "occasionally"]),
                kids: faker.helpers.arrayElement(["yes", "no", "maybe"]),
                politics: faker.helpers.arrayElement(["liberal", "conservative", "moderate", "apolitical"]),
                religion: faker.helpers.arrayElement(["Hindu", "Christian", "Muslim", "Buddhist", "Atheist", "Other"]),
                currentlyLiving: faker.location.city(),
            };

            users.push(user);
        }

        await User.insertMany(users);
        console.log("Seeded 50 users successfully!");
    } catch (error) {
        console.error("Error seeding users:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seeder
seedUsers();
