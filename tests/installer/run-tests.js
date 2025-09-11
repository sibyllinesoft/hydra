#!/usr/bin/env node

import { run } from 'node:test';
import { spec as SpecReporter } from 'node:test/reporters';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🧪 Running Hydra Installer Tests...\n');
  
  try {
    // Find all test files
    const testFiles = [
      path.join(__dirname, 'installer.test.js'),
      path.join(__dirname, 'permissions.test.js'),
      path.join(__dirname, 'integration.test.js')
    ];
    
    // Check that test files exist
    for (const testFile of testFiles) {
      if (!(await fs.pathExists(testFile))) {
        console.error(`❌ Test file not found: ${testFile}`);
        process.exit(1);
      }
    }
    
    console.log(`📁 Found ${testFiles.length} test files:`);
    testFiles.forEach(file => {
      console.log(`   - ${path.relative(__dirname, file)}`);
    });
    console.log('');
    
    // Configure test runner
    const stream = run({
      files: testFiles,
      concurrency: 1, // Run tests sequentially to avoid conflicts
      timeout: 60000, // 60 second timeout per test
      only: false
    });
    
    // Use spec reporter for detailed output
    stream.compose(new SpecReporter()).pipe(process.stdout);
    
    // Handle completion
    stream.on('test:fail', (data) => {
      console.error(`❌ Test failed: ${data.name}`);
      if (data.details?.error) {
        console.error(`   Error: ${data.details.error.message}`);
        if (data.details.error.stack) {
          console.error(`   Stack: ${data.details.error.stack}`);
        }
      }
    });
    
    stream.on('test:pass', (data) => {
      console.log(`✅ Test passed: ${data.name}`);
    });
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    stream.on('test:complete', (data) => {
      totalTests++;
      if (data.pass) {
        passedTests++;
      } else {
        failedTests++;
      }
    });
    
    await new Promise((resolve, reject) => {
      stream.on('end', () => {
        console.log('\n📊 Test Summary:');
        console.log(`   Total: ${totalTests}`);
        console.log(`   Passed: ${passedTests}`);
        console.log(`   Failed: ${failedTests}`);
        
        if (failedTests === 0) {
          console.log('\n🎉 All tests passed!');
          resolve();
        } else {
          console.log(`\n❌ ${failedTests} test(s) failed!`);
          process.exit(1);
        }
      });
      
      stream.on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

// Cleanup function to ensure temp directories are cleaned up
process.on('SIGINT', () => {
  console.log('\n🛑 Test run interrupted. Cleaning up...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test run terminated. Cleaning up...');
  process.exit(1);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { runTests };