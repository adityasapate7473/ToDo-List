const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.get('/tasks', async (req, res) => {
    const { priority, userId } = req.query; // Get priority and userId from query parameters
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const filter = { userId }; // Filter tasks by userId
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    const { title, priority, userId } = req.body; // Include userId in the task creation
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const newTask = new Task({ title, priority, userId }); // Save userId with the task
    await newTask.save();
    res.status(201).json(newTask);
});

app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, completed, priority } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
        id,
        { title, completed, priority },
        { new: true }
    );
    res.json(updatedTask);
});

app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(204).send();
});

// Start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
