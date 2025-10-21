// backend/scripts/convertFiles.js
const fs = require('fs');
const path = require('path');

// Function to convert a single file from JavaScript to TypeScript
function convertFile(jsFilePath) {
  // Create TypeScript file path by changing extension
  const tsFilePath = jsFilePath.replace(/\.js$/, '.ts');
  
  // Skip if TypeScript file already exists
  if (fs.existsSync(tsFilePath)) {
    console.log(`TypeScript file already exists: ${tsFilePath}`);
    return;
  }
  
  try {
    // Read the JavaScript file
    const jsContent = fs.readFileSync(jsFilePath, 'utf8');
    
    // Initial conversion (basic replacement of import/export syntax)
    let tsContent = jsContent
      // Convert CommonJS requires to ES6 imports
      .replace(/const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";')
      .replace(/const\s+\{\s*([^}]+)\s*\}\s+=\s+require\(['"]([^'"]+)['"]\);?/g, 'import { $1 } from "$2";')
      
      // Convert module.exports
      .replace(/module\.exports\s+=\s+(\w+);?/g, 'export default $1;')
      .replace(/module\.exports\s+=\s+\{([^}]+)\};?/g, 'export {$1};');
    
    // Write the TypeScript file
    fs.writeFileSync(tsFilePath, tsContent, 'utf8');
    console.log(`Converted: ${path.basename(jsFilePath)} -> ${path.basename(tsFilePath)}`);
  } catch (error) {
    console.error(`Error converting file ${jsFilePath}: ${error.message}`);
  }
}

// Function to recursively find JavaScript files in a directory
function findJsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory doesn't exist: ${dir}`);
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main function to convert all JavaScript files in the specified directories
function convertJsToTs(directories) {
  let totalFiles = 0;
  let convertedFiles = 0;
  
  directories.forEach(dir => {
    console.log(`Processing directory: ${dir}`);
    const jsFiles = findJsFiles(dir);
    totalFiles += jsFiles.length;
    
    jsFiles.forEach(file => {
      convertFile(file);
      convertedFiles++;
    });
  });
  
  console.log(`Conversion complete: ${convertedFiles}/${totalFiles} files converted`);
}

// Directories to process
const directories = [
  path.join(__dirname, '..', 'src', 'controllers'),
  path.join(__dirname, '..', 'src', 'routes'),
  path.join(__dirname, '..', 'src', 'middleware'),
  path.join(__dirname, '..', 'src', 'utils'),
  path.join(__dirname, '..', 'src', 'services')
];

// Run the conversion
convertJsToTs(directories);