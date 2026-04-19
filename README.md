# Soft Goals Manager

🇷🇺 Русская версия: [README_ru.md](README_ru.md)  
🇬🇧 English version: see below.

Soft Goals Manager is a personal goals tracking application that provides a powerful command‑line tool, a RESTful API server, and a feature‑rich web interface.

## Features

- **Command‑line interface (CLI):** manage your goals from the terminal. Add goals with a description, optional due date, category and priority. List goals with filters (category, priority, overdue, due within N days) and sorting options, edit existing goals, mark goals as complete/incomplete and delete goals. The CLI stores goals in a JSON file for persistence.
- **REST API server:** built with Express.js and persisting data to `goals.json`. It exposes endpoints to list, create, update and delete goals. New goals include `text`, `dueDate`, `category`, `priority` (default is `"medium"`) and `completed` status.
- **Web front‑end:** a modern responsive interface built with HTML/CSS/JavaScript. The UI supports dark mode, a theme toggle, search, category/priority filters, overdue and due‑within filters, sorting, and displays statistics (total, completed, overdue and due soon). You can edit, complete/undo and delete goals directly in the UI. Notifications inform you about actions.

## Prerequisites

- [Node.js](https://nodejs.org/) version 14 or higher
- npm (comes with Node.js)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/danilbr235-beep/Soft.git
cd Soft
npm install
```

## Running the Web Application

Start the Express server (serves the API and static files in `/public`):

```bash
npm start
```

By default the server runs on port 3000. Open your browser and navigate to `http://localhost:3000` to access the goals manager web app.

## CLI Usage

You can run the CLI via npx or node. Use the following commands:

```bash
# Add a goal with optional due date, category and priority
npx soft-cli add "Read a book" --due=2026-05-01 --category=education --priority=high

# List all goals (can filter by category, priority, overdue, due within)
npx soft-cli list --category=education --priority=high --due-within=7 --overdue

# Edit a goal: change text, due date, category or priority
npx soft-cli edit <id> --text="Read two books" --due=2026-05-10 --category=education --priority=medium

# Mark a goal as complete or undo completion
npx soft-cli complete <id>

# Delete a goal
npx soft-cli delete <id>

# See all available commands
npx soft-cli help
```

Goals are stored in `goals.json` in the repository root. The CLI is defined in `index_priority.js` and registered as the `soft-cli` binary in `package.json`.

## Project Structure

- **app_priority.js** – Express server with REST API and priority support.
- **index_priority.js** – CLI script for managing goals.
- **public/index.html** – Web interface.
- **public/styles_v5.css** – CSS for light/dark themes, layout, badges and notifications.
- **public/new_script_v7.js** – Client‑side JavaScript with search, filters, sorting, statistics, dark mode and priority badges.
- **goals.json** – JSON file for persisting goals.

## License

This project is released under the MIT License.
