#!/usr/bin/env node

/**
 * Entry point for the Soft project.
 *
 * This simple command‑line script prints a greeting message and, if the user
 * provides any numeric arguments, computes their sum. It serves as a
 * demonstration of a Node.js CLI tool that can be easily extended with
 * additional functionality.
 */
function main() {
  // Greet the user
  console.log('Hello from the Soft project!');

  // Extract command‑line arguments after the script name
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Attempt to convert all arguments to numbers
    const numbers = args.map((arg) => {
      const num = Number(arg);
      if (Number.isNaN(num)) {
        console.warn(`Warning: '${arg}' is not a valid number and will be ignored.`);
        return 0;
      }
      return num;
    });
    // Compute the sum of the numbers
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    console.log(`Sum of provided numbers: ${sum}`);
  } else {
    console.log('Provide numbers as command‑line arguments to compute their sum.');
  }
}

// Run the main function when the script is executed directly
if (require.main === module) {
  main();
}
