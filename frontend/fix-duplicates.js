const fs = require('fs');
const path = require('path');

// Directory containing step definitions
const stepsDir = path.join(__dirname, 'cypress/support/step_definitions');

// Read all step definition files
const files = fs.readdirSync(stepsDir).filter(f => f.endsWith('.ts'));

// Extract all step definitions
const stepDefinitions = {};
const duplicates = {};

files.forEach(file => {
  const filePath = path.join(stepsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Match Given, When, Then patterns
  const regex = /^(Given|When|Then)\(['"](.+?)['"]/gm;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const stepType = match[1];
    const stepPattern = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const key = `${stepType}('${stepPattern}'`;
    
    if (!stepDefinitions[key]) {
      stepDefinitions[key] = [];
    }
    
    stepDefinitions[key].push({
      file,
      line: lineNumber,
      fullMatch: match[0]
    });
  }
});

// Find duplicates
Object.entries(stepDefinitions).forEach(([key, locations]) => {
  if (locations.length > 1) {
    duplicates[key] = locations;
  }
});

// Report duplicates
console.log('Found duplicate step definitions:\n');
Object.entries(duplicates).forEach(([key, locations]) => {
  console.log(`${key}:`);
  locations.forEach(loc => {
    console.log(`  - ${loc.file}:${loc.line}`);
  });
  console.log();
});

// Keep track of files to modify
const filesToFix = {};

// Decide which duplicates to keep (keep the first one, comment out others)
Object.entries(duplicates).forEach(([key, locations]) => {
  // Keep the first occurrence, comment out the rest
  for (let i = 1; i < locations.length; i++) {
    const loc = locations[i];
    if (!filesToFix[loc.file]) {
      filesToFix[loc.file] = [];
    }
    filesToFix[loc.file].push({
      line: loc.line,
      pattern: key,
      keepFile: locations[0].file
    });
  }
});

// Fix the duplicates
Object.entries(filesToFix).forEach(([fileName, fixes]) => {
  const filePath = path.join(stepsDir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Sort fixes by line number in reverse order (to preserve line numbers)
  fixes.sort((a, b) => b.line - a.line);
  
  fixes.forEach(fix => {
    const lineIndex = fix.line - 1;
    
    // Find the step definition block
    let endLine = lineIndex;
    let braceCount = 0;
    let inDefinition = false;
    
    for (let i = lineIndex; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('=>')) {
        inDefinition = true;
      }
      if (inDefinition) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0 && line.includes(');')) {
          endLine = i;
          break;
        }
      }
    }
    
    // Comment out the duplicate
    lines[lineIndex] = `// Duplicate - already defined in ${fix.keepFile}`;
    for (let i = lineIndex + 1; i <= endLine; i++) {
      lines[i] = '// ' + lines[i];
    }
  });
  
  // Write back the fixed content
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`Fixed ${fileName}: commented out ${fixes.length} duplicate(s)`);
});

console.log('\nDuplicates fixed!');