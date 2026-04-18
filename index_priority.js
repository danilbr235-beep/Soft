#!/usr/bin/env node

/**
 * Enhanced CLI for the Soft goals manager with support for priority levels.
 *
 * This script allows you to add, list, edit, complete and delete goals stored
 * in a local JSON file. Each goal can have optional due date, category and
 * priority (low, medium, high). You can filter and sort goals when listing
 * them. See the help output for examples.
 */

const fs = require('fs');
const path = require('path');

// Path to the goals data file. This file is shared between the CLI and the
// Express server. When run from the root of the project the file will live
// alongside this script.
const DATA_FILE = path.join(__dirname, 'goals.json');

/**
 * Load goals from the JSON file. If the file does not exist or cannot be
 * parsed an empty array is returned.
 * @returns {Array} Array of goal objects
 */
function loadGoals() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * Save goals array to the JSON file. The file is overwritten each time.
 * @param {Array} goals Array of goal objects
 */
function saveGoals(goals) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(goals, null, 2), 'utf8');
}

/**
 * Add a new goal to the collection.
 * @param {Object} options Options containing text, dueDate, category and priority
 */
function addGoal(options) {
  const { text, dueDate, category, priority } = options;
  if (!text || text.trim() === '') {
    console.error('Error: Please specify a goal description.');
    return;
  }
  const goals = loadGoals();
  const newGoal = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
  };
  if (dueDate) newGoal.dueDate = dueDate;
  if (category) newGoal.category = category;
  // Default priority to medium if not provided
  newGoal.priority = priority || 'medium';
  goals.push(newGoal);
  saveGoals(goals);
  console.log(`Added goal ${newGoal.id}.`);
}

/**
 * List goals, optionally filtered by category, priority, overdue status or due
 * within a number of days. Results are printed to stdout.
 * @param {Object} options Filtering options
 */
function listGoals(options) {
  const goals = loadGoals();
  const now = new Date();
  let filtered = goals;
  if (options.category) {
    filtered = filtered.filter((g) => g.category === options.category);
  }
  if (options.priority) {
    filtered = filtered.filter((g) => g.priority === options.priority);
  }
  if (options.overdue) {
    filtered = filtered.filter(
      (g) => g.dueDate && new Date(g.dueDate) < now && !g.completed
    );
  }
  if (typeof options.dueWithin === 'number' && !isNaN(options.dueWithin)) {
    const limit = new Date(now.getTime() + options.dueWithin * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(
      (g) => g.dueDate && new Date(g.dueDate) <= limit
    );
  }
  // Sort if requested
  let items = filtered;
  if (options.sortBy) {
    const criterion = options.sortBy;
    if (criterion === 'due') {
      items = items.slice().sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate) : null;
        const bDate = b.dueDate ? new Date(b.dueDate) : null;
        if (aDate && bDate) return aDate - bDate;
        if (aDate) return -1;
        if (bDate) return 1;
        return 0;
      });
    } else if (criterion === 'priority') {
      const order = { low: 0, medium: 1, high: 2 };
      items = items.slice().sort((a, b) => {
        return (order[a.priority] || 0) - (order[b.priority] || 0);
      });
    } else if (criterion === 'category') {
      items = items.slice().sort((a, b) => {
        if (a.category && b.category) return a.category.localeCompare(b.category);
        if (a.category) return -1;
        if (b.category) return 1;
        return 0;
      });
    } else if (criterion === 'completed') {
      items = items.slice().sort((a, b) => {
        return (a.completed === b.completed) ? 0 : (a.completed ? 1 : -1);
      });
    }
  }
  if (items.length === 0) {
    console.log('No goals found.');
    return;
  }
  items.forEach((g) => {
    let line = `${g.id}. ${g.text}`;
    if (g.completed) line += ' [completed]';
    if (g.category) line += ` [${g.category}]`;
    if (g.dueDate) line += ` [due: ${g.dueDate}]`;
    if (g.priority) line += ` [priority: ${g.priority}]`;
    console.log(line);
  });
}

/**
 * Mark a goal as complete or incomplete. If the goal is already completed it
 * toggles back to incomplete.
 * @param {string} id Goal identifier
 */
function completeGoal(id) {
  if (!id) {
    console.error('Error: Please provide the goal ID to complete.');
    return;
  }
  const goals = loadGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) {
    console.error(`Error: Goal ${id} not found.`);
    return;
  }
  goal.completed = !goal.completed;
  saveGoals(goals);
  console.log(`Goal ${id} ${goal.completed ? 'completed' : 'uncompleted'}.`);
}

/**
 * Delete a goal from the collection.
 * @param {string} id Goal identifier
 */
function deleteGoal(id) {
  if (!id) {
    console.error('Error: Please provide the goal ID to delete.');
    return;
  }
  let goals = loadGoals();
  const initialLength = goals.length;
  goals = goals.filter((g) => g.id !== id);
  if (goals.length === initialLength) {
    console.error(`Error: Goal ${id} not found.`);
    return;
  }
  saveGoals(goals);
  console.log(`Deleted goal ${id}.`);
}

/**
 * Edit an existing goal. Only the specified properties are updated. To remove
 * a property such as due date, category or priority, pass an empty string or
 * null via the corresponding option.
 * @param {string} id Goal identifier
 * @param {Object} updates Fields to update: text, dueDate, category, priority
 */
function editGoal(id, updates) {
  if (!id) {
    console.error('Error: Please provide the goal ID to edit.');
    return;
  }
  const goals = loadGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) {
    console.error(`Error: Goal ${id} not found.`);
    return;
  }
  if (updates.text !== undefined) {
    if (updates.text === null || updates.text.trim() === '') {
      // ignore if text set to empty or null
    } else {
      goal.text = updates.text.trim();
    }
  }
  if (updates.dueDate !== undefined) {
    if (updates.dueDate === null || updates.dueDate === '') {
      delete goal.dueDate;
    } else {
      goal.dueDate = updates.dueDate;
    }
  }
  if (updates.category !== undefined) {
    if (updates.category === null || updates.category === '') {
      delete goal.category;
    } else {
      goal.category = updates.category;
    }
  }
  if (updates.priority !== undefined) {
    if (updates.priority === null || updates.priority === '') {
      delete goal.priority;
    } else {
      goal.priority = updates.priority;
    }
  }
  saveGoals(goals);
  console.log(`Goal ${id} updated.`);
}

/**
 * Display usage information and examples.
 */
function showHelp() {
  console.log(`Soft Goals Manager CLI with Priority Support

Usage:
  npx soft-cli add "<description>" [--due=YYYY-MM-DD] [--category=tag] [--priority=low|medium|high]
      Add a new goal with optional due date, category and priority. The priority
      defaults to 'medium' if not specified.

  npx soft-cli list [--category=tag] [--priority=level] [--overdue] [--due-within=N] [--sort-by=due|category|priority|completed]
      List all goals, optionally filtering by category, priority, overdue status or
      due within N days. You can also sort results by due date, category,
      priority or completion status.

  npx soft-cli edit <id> [--text="New description"] [--due=YYYY-MM-DD|null] [--category=tag|null] [--priority=low|medium|high|null]
      Update fields of an existing goal. Pass an empty string or 'null' after '='
      to remove a field (e.g. --category= to remove category).

  npx soft-cli complete <id>
      Toggle completion status for a goal.

  npx soft-cli delete <id>
      Delete a goal by its ID.

  npx soft-cli help
      Show this help message.

Examples:
  npx soft-cli add "Finish report" --due=2026-04-30 --category=work --priority=high
  npx soft-cli list --category=work --priority=high --due-within=7
  npx soft-cli edit 123456789 --priority=low
`);
}

/**
 * Parse command-line arguments into a structured object. Supports positional
 * arguments and --flag=value syntax. For the add command any arguments that
 * are not flags are concatenated into the text field. For edit the first
 * non-flag argument is treated as the goal ID.
 * @param {string[]} argv Raw argument list (excluding node and script)
 * @returns {Object} An object with command and options
 */
function parseArguments(argv) {
  if (argv.length === 0) {
    return { command: null, options: {} };
  }
  const command = argv[0];
  const options = {};
  // Commands that operate on an ID
  let i = 1;
  if (['complete', 'delete'].includes(command)) {
    options.id = argv[1];
    return { command, options };
  }
  if (command === 'edit') {
    options.id = argv[1];
    i = 2;
  }
  // For the add command we concatenate non-flag args into text
  let textParts = [];
  for (; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      let flag;
      let value;
      if (eqIndex >= 0) {
        flag = arg.slice(0, eqIndex);
        value = arg.slice(eqIndex + 1);
      } else {
        flag = arg;
        value = undefined;
      }
      switch (flag) {
        case '--due':
          options.dueDate = value || undefined;
          break;
        case '--category':
          options.category = value || undefined;
          break;
        case '--priority':
          options.priority = value || undefined;
          break;
        case '--text':
          options.text = value || undefined;
          break;
        case '--due-within':
          options.dueWithin = value ? parseInt(value, 10) : undefined;
          break;
        case '--overdue':
          options.overdue = true;
          break;
        case '--sort-by':
          options.sortBy = value || undefined;
          break;
        default:
          break;
      }
    } else {
      textParts.push(arg);
    }
  }
  // Set text if not explicitly provided via --text
  if (!options.text && textParts.length > 0 && command === 'add') {
    options.text = textParts.join(' ');
  }
  return { command, options };
}

/**
 * Main entry point. Determines which command to execute based on CLI args.
 */
function main() {
  const { command, options } = parseArguments(process.argv.slice(2));
  switch (command) {
    case 'add':
      addGoal(options);
      break;
    case 'list':
      listGoals(options);
      break;
    case 'edit':
      editGoal(options.id, {
        text: options.text,
        dueDate: options.dueDate,
        category: options.category,
        priority: options.priority,
      });
      break;
    case 'complete':
      completeGoal(options.id);
      break;
    case 'delete':
      deleteGoal(options.id);
      break;
    case 'help':
    case undefined:
    case null:
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      break;
  }
}

if (require.main === module) {
  main();
}