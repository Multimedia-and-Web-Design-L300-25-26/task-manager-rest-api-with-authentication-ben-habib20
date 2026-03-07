import Task from "../models/Task.js";

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        const task = new Task({
            title,
            description,
            completed,
            owner: req.user._id,
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            if (task.owner.toString() !== req.user._id.toString()) {
                res.status(401).json({ message: "Not authorized to delete this task" });
                return;
            }
            await task.deleteOne();
            res.json({ message: "Task removed" });
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
