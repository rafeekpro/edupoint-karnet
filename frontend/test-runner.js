const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Uruchamiam wszystkie testy Cypress...\n');

// Lista wszystkich plików testowych
const testFiles = fs.readdirSync('cypress/e2e/features')
  .filter(f => f.endsWith('.feature'))
  .sort();

const results = {
  passed: [],
  failed: []
};

console.log(`Znaleziono ${testFiles.length} plików testowych\n`);

// Uruchom każdy test osobno
testFiles.forEach((file, index) => {
  console.log(`[${index + 1}/${testFiles.length}] Testuję: ${file}`);
  
  try {
    const output = execSync(
      `npx cypress run --spec "cypress/e2e/features/${file}" --reporter json 2>/dev/null`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    const json = JSON.parse(output);
    
    if (json.stats.failures === 0) {
      results.passed.push(file);
      console.log(`  ✅ PRZESZEDŁ (${json.stats.passes} testów)\n`);
    } else {
      results.failed.push({
        file: file,
        stats: json.stats,
        failures: json.failures.map(f => ({
          title: f.title,
          error: f.err.message.split('\n')[0]
        }))
      });
      console.log(`  ❌ NIE PRZESZEDŁ (${json.stats.failures} błędów)\n`);
    }
  } catch (error) {
    // Jeśli test się wykrzaczył kompletnie
    results.failed.push({
      file: file,
      error: 'Test execution failed completely'
    });
    console.log(`  ❌ BŁĄD WYKONANIA\n`);
  }
});

// Wyświetl podsumowanie
console.log('\n' + '='.repeat(80));
console.log('📊 PODSUMOWANIE TESTÓW');
console.log('='.repeat(80));

console.log(`\n✅ DZIAŁAJĄCE TESTY (${results.passed.length}/${testFiles.length}):`);
if (results.passed.length > 0) {
  results.passed.forEach(f => console.log(`  - ${f}`));
} else {
  console.log('  Brak');
}

console.log(`\n❌ NIEDZIAŁAJĄCE TESTY (${results.failed.length}/${testFiles.length}):\n`);
if (results.failed.length > 0) {
  results.failed.forEach(test => {
    console.log(`📁 ${test.file}`);
    
    if (test.failures) {
      test.failures.forEach(failure => {
        console.log(`   ❌ ${failure.title}`);
        console.log(`      Błąd: ${failure.error}`);
      });
    } else if (test.error) {
      console.log(`   ❌ ${test.error}`);
    }
    console.log('');
  });
} else {
  console.log('  Wszystkie testy przeszły!');
}

console.log('='.repeat(80));
console.log(`Wynik: ${results.passed.length} działających, ${results.failed.length} niedziałających`);
console.log('='.repeat(80));