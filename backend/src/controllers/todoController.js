const Todo = require('../models/Todo');
const { validateTodo } = require('../utils/validators');
const logger = require('../utils/logger');
const cacheService = require('../services/cacheService');

exports.getAllTodos = async (req, res) => {
  try {
    const cachedTodos = await cacheService.get(`todos:${req.user.id}`);
    if (cachedTodos) {
      return res.json(JSON.parse(cachedTodos));
    }

    const todos = await Todo.find({ user: req.user.id }).sort('-createdAt');
    await cacheService.set(`todos:${req.user.id}`, JSON.stringify(todos), 300); // Cache for 5 minutes

    res.json(todos);
  } catch (error) {
    logger.error('Error in getAllTodos', { error });
    res.status(500).json({ message: 'Error fetching todos' });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { error } = validateTodo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = new Todo({
      title: req.body.title,
      user: req.user.id
    });

    await todo.save();
    await cacheService.del(`todos:${req.user.id}`); // Invalidate cache

    res.status(201).json(todo);
  } catch (error) {
    logger.error('Error in createTodo', { error });
    res.status(500).json({ message: 'Error creating todo' });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { error } = validateTodo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    await cacheService.del(`todos:${req.user.id}`); // Invalidate cache

    res.json(todo);
  } catch (error) {
    logger.error('Error in updateTodo', { error });
    res.status(500).json({ message: 'Error updating todo' });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    await cacheService.del(`todos:${req.user.id}`); // Invalidate cache

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteTodo', { error });
    res.status(500).json({ message: 'Error deleting todo' });
  }
};
