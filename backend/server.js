const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Base URL
const API_BASE_URL = '/api';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
    title: String,
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    userId: { type: String, required: true }, // Store the user's ID
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

taskSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedAt = new Date();
    next();
});

const Task = mongoose.model('Task', taskSchema);

// REST APIs
app.get(`${API_BASE_URL}/tasks`, async (req, res) => {
    const { priority, userId } = req.query; // Get priority and userId from query parameters
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const filter = { userId }; // Filter tasks by userId
    if (priority) filter.priority = priority;

    try {
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post(`${API_BASE_URL}/tasks`, async (req, res) => {
    const { title, priority, userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const newTask = new Task({ title, priority, userId });

    try {
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.put(`${API_BASE_URL}/tasks/:id`, async (req, res) => {
    const { id } = req.params;
    const { title, completed, priority } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { title, completed, priority },
            { new: true }
        );
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete(`${API_BASE_URL}/tasks/:id`, async (req, res) => {
    const { id } = req.params;

    try {
        await Task.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Default route for undefined paths
app.use((req, res) => {
    res.status(404).send("Route not found");
});

// Start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
