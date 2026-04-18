# Soft CLI

This repository contains a simple Node.js command‑line interface (CLI) example. The script prints a greeting message and, if numeric arguments are provided, computes their sum.

## Installation

To install the dependencies and run the script locally, clone this repository and install Node.js (version 14 or above):

```
git clone https://github.com/danilbr235-beep/Soft.git
cd Soft
npm install
```

## Usage

Run the CLI script using Node.js (from within the repository):

```
node index.js
```

You can also pass any number of numeric arguments to compute their sum:

```
node index.js 1 2 3
# Output: Hello from the Soft project!
#         Sum of provided numbers: 6
```

Non‑numeric arguments are ignored with a warning.
