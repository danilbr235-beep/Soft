# Soft Goals Manager
> 🇷🇺 Русская версия: [README_ru.md](README_ru.md)  
> 🇬🇧 English version: see below.


This repository contains a personal goals management application. It includes:

- A **command-line interface (CLI)** for managing goals via terminal commands.
- A **RESTful API server** built with Express.js that stores goals in a JSON file.
- A **web front-end** (HTML/CSS/JavaScript) that interacts with the API to add, list, complete and delete goals.

## Prerequisites

- [Node.js](https://nodejs.org/) version 14 or higher.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/danilbr235-beep/Soft.git
cd Soft
npm install
```

## Running the Web Application

Start the Express server, which serves the API and static files in `/public`:

```bash
npm start
```

The server listens on port 3000 by default. Open your browser at [http://localhost:3000](http://localhost:3000) to access the web interface.

The web interface allows you to:

- Add a new goal.
- View the list of existing goals.
- Mark a goal as complete.
- Delete a goal.

All goals are stored in `goals.json`.

## Using the CLI

The CLI script (`index.js`) provides similar functionality via the terminal:

```bash
node index.js add "Learn Node.js"
node index.js list
node index.js complete 1
node index.js delete 1
```

Pass `--help` to see usage instructions.

## File Structure

```
app.js         # Express server and API routes
goals.json     # JSON file used for storing goals
index.js       # CLI script
package.json   # Node.js package configuration
public/
  index.html   # Web page structure
  styles.css   # Styling for the web interface
  script.js    # Client-side logic for interacting with the API
README.md      # This document
```

## License

This project is licensed under the ISC License.
