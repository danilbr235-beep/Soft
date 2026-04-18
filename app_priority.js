// Express server with priority field support

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Path to the goals storage file
const GOALS_FILE = path.join(__dirname, 'goals.json');

/**
 * Load goals from the JSON file. If the file doesn't exist, return an empty array.
 * @returns {Array}
 */
function loadGoals() {
  try {
    const data = fs.readFileSync(GOALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Persist the goals array back to the JSON file.
 * @param {Array} goals
 */
function saveGoals(goals) {
  fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2));
}

// Retrieve all goals
app.get('/api/goals', (req, res) => {
  const goals = loadGoals();
  res.json(goals);
});

// Create a new goal with optional dueDate, category and priority
app.post('/api/goals', (req, res) => {
  const goals = loadGoals();
  const { text, dueDate, category, priority } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const newGoal = {
    id: String(Date.now()),
    text,
    completed: false,
    category: category || null,
    dueDate: dueDate || null,
    priority: priority || 'medium'
  };
  goals.push(newGoal);
  saveGoals(goals);
  res.status(201).json(newGoal);
});

// Update an existing goal by ID. Fields that are undefined are ignored.
app.put('/api/goals/:id', (req, res) => {
  const goals = loadGoals();
  const id = req.params.id;
  const goal = goals.find(g => g.id === id);
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  const { text, completed, dueDate, category, priority } = req.body;
  // Update provided fields
  if (text !== undefined) goal.text = text;
  if (completed !== undefined) goal.completed = completed;
  if (category !== undefined) goal.category = category;
  if (dueDate !== undefined) goal.dueDate = dueDate;
  if (priority !== undefined) goal.priority = priority;
  saveGoals(goals);
  res.json(goal);
});

// Delete a goal by ID
app.delete('/api/goals/:id', (req, res) => {
  const goals = loadGoals();
  const id = req.params.id;
  const index = goals.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  goals.splice(index, 1);
  saveGoals(goals);
  res.status(204).send();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});