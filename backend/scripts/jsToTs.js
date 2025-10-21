// backend/scripts/jsToTs.js
/**
 * Helper script to convert JavaScript files to TypeScript
 * This script will rename all .js files to .ts files
 * It will also update imports and exports to use ES6 syntax
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  path.join(__dirname, '..', 'src', 'controllers'),
  path.join(__dirname, '..', 'src', 'middleware'),
  path.join(__dirname, '..', 'src', 'routes'),
  path.join(__dirname, '..', 'src', 'utils'),
  path.join(__dirname, '..', 'src', 'services')
];

// Function to convert require statements to import statements
function convertRequireToImport(content) {
  // Convert require statements to import statements
  content = content.replace(/const\s+(\w+)\s*=\s*require\(['"](.*)['"]\);?/g, 'import $1 from "$2";');
  
  // Convert destructured require statements to import statements
  content = content.replace(/const\s+\{\s*(.*)\s*\}\s*=\s*require\(['"](.*)['"]\);?/g, 'import { $1 } from "$2";');
  
  // Convert module.exports to export default
  content = content.replace(/module\.exports\s*=\s*(\w+);?/g, 'export default $1;');
  
  // Convert module.exports = { ... } to export { ... }
  content = content.replace(/module\.exports\s*=\s*\{([\s\S]*?)\};?/g, (match, exports) => {
    return `export {${exports}};`;
  });
  
  return content;
}

// Function to process a single file
function processFile(filePath) {
  // Skip already converted .ts files
  if (path.extname(filePath) === '.ts') {
    return;
  }

  if (path.extname(filePath) === '.js') {
    const content = fs.readFileSync(filePath, 'utf8');
    const tsContent = convertRequireToImport(content);
    
    // Create the .ts file with the converted content
    const tsFilePath = filePath.replace('.js', '.ts');
    fs.writeFileSync(tsFilePath, tsContent, 'utf8');
    
    console.log(`Converted: ${path.basename(filePath)} -> ${path.basename(tsFilePath)}`);
  }
}

// Function to recursively process a directory
function processDirectory(directory) {
  // Check if directory exists
  if (!fs.existsSync(directory)) {
    console.log(`Directory doesn't exist: ${directory}`);
    return;
  }
  
  // Read all files in the directory
  const files = fs.readdirSync(directory);
  
  // Process each file
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else {
      processFile(filePath);
    }
  });
}

// Process all directories
directories.forEach(directory => {
  console.log(`Processing directory: ${directory}`);
  processDirectory(directory);
});

console.log('Conversion complete. Please review the converted files manually to fix any issues.');