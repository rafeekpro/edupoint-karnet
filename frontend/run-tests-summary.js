const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Running Cypress tests...\n');

const testFiles = [
  'admin-add-user-simple.feature',
  'admin-dashboard.feature',
  'admin-edit-delete-user-ui.feature',
  'admin-edit-delete-user.feature',
  'admin-login-bug-detection.feature',
  'admin-user-management.feature',
  'admin-users-simple.feature',
  'client-dashboard.feature',
  'client-vouchers-optimized.feature',
  'client-vouchers.feature',
  'login.feature',
  'organizations.feature',
  'role-based-access.feature',
  'role-routing.feature',
  'settings.feature',
  'therapist-clients-optimized.feature',
  'therapist-dashboard.feature',
  'voucher-management.feature',
  'voucher-pages.feature',
  'voucher-types.feature'
];

const results = {
  passed: [],
  failed: [],
  errors: {}
};

let current = 0;

function runTest(file) {
  return new Promise((resolve) => {
    const spec = `cypress/e2e/features/${file}`;
    console.log(`[${current + 1}/${testFiles.length}] Testing: ${file}`);
    
    exec(`npx cypress run --spec "${spec}" --reporter json 2>/dev/null`, (error, stdout, stderr) => {
      try {
        const json = JSON.parse(stdout);
        const stats = json.stats;
        
        if (stats.failures > 0) {
          results.failed.push(file);
          results.errors[file] = json.failures.map(f => ({
            title: f.title,
            error: f.err.message.split('\n')[0]
          }));
        } else {
          results.passed.push(file);
        }
        
        console.log(`  ✅ Passed: ${stats.passes}, ❌ Failed: ${stats.failures}`);
      } catch (e) {
        results.failed.push(file);
        results.errors[file] = [{ title: 'Test execution failed', error: 'Could not parse test results' }];
        console.log(`  ❌ Test execution failed`);
      }
      
      current++;
      resolve();
    });
  });
}

async function runAllTests() {
  for (const file of testFiles) {
    await runTest(file);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n✅ PASSED (${results.passed.length}/${testFiles.length}):`);
  results.passed.forEach(f => console.log(`  - ${f}`));
  
  console.log(`\n❌ FAILED (${results.failed.length}/${testFiles.length}):`);
  results.failed.forEach(f => {
    console.log(`\n  📁 ${f}:`);
    if (results.errors[f]) {
      results.errors[f].forEach(err => {
        console.log(`    - ${err.title}`);
        console.log(`      Error: ${err.error}`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${results.passed.length} passed, ${results.failed.length} failed`);
}

runAllTests();