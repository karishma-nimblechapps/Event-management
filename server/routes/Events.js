const express = require("express");
const router = express.Router();
const { Events, Reviews, UserEvents, EventAnalytics } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "./uploads/events";
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimetype = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed!"));
    }
});

// Fetch all events
router.get("/", async (req, res) => {
    try {
        const events = await Events.findAll();
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// Create a new event (Requires Authentication)
router.post("/", validateToken, upload.single("image"), async (req, res) => {
    try {
        console.log("Received Event Data:", req.body); // Debugging
        
        const { title, location, description, date, time, category } = req.body;
        
        // Validate required fields
        if (!title || !location || !description || !date || !time || !category) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create new event object
        const newEventData = {
            title,
            location,
            description,
            date,
            time,
            category,
            username: req.user.username
        };

        // Add image path if an image was uploaded
        if (req.file) {
            newEventData.image = `/uploads/events/${req.file.filename}`;
        }

        const newEvent = await Events.create(newEventData);

        await UserEvents.create({
            userId:req.user.id,
            eventId: newEvent.id,
        })

        await EventAnalytics.create({
            eventId: newEvent.id})

        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

// Fetch specific event details and its reviews
router.get("/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;


        const event = await Events.findByPk(eventId, {
            attributes: ["id", "title", "location", "description", "date", "time", "category", "image", "username"],
        });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        const reviews = await Reviews.findAll({
            where: { EventId: eventId },
            attributes: ["id", "review_text", "rating", "username", "createdAt", "sentiment", "admin_response"],
        });

        res.json({ event, reviews });
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});

// Update an event (Requires Authentication & Ownership)
router.put("/:eventId", validateToken, upload.single("image"), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Events.findByPk(eventId);

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Ensure that only the event creator can update it
        if (event.username !== req.user.username) {
            return res.status(403).json({ error: "You are not authorized to update this event" });
        }

        const { title, location, description, date, time, category } = req.body;
        
        // Update event data
        const updateData = {
            title: title || event.title,
            location: location || event.location,
            description: description || event.description,
            date: date || event.date,
            time: time || event.time,
            category: category || event.category
        };

        // Update image if a new one was uploaded
        if (req.file) {
            // Delete old image if exists
            if (event.image) {
                const oldImagePath = path.join(__dirname, '..', event.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = `/uploads/events/${req.file.filename}`;
        }

        await Events.update(updateData, { where: { id: eventId } });
        
        const updatedEvent = await Events.findByPk(eventId);
        res.json(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event" });
    }
});

// Delete an event (Requires Authentication & Ownership)
router.delete("/:eventId", validateToken, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Events.findByPk(eventId);

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Ensure that only the event creator can delete it
        if (event.username !== req.user.username) {
            return res.status(403).json({ error: "You are not authorized to delete this event" });
        }

        // Delete associated image if it exists
        if (event.image) {
            const imagePath = path.join(__dirname, '..', event.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Events.destroy({ where: { id: eventId } });
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
});

// Serve static event images
router.get("/images/:filename", (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, "../uploads/events", filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ error: "Image not found" });
    }
});

module.exports = router;