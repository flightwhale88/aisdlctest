const { execSync } = require('child_process');
const path = require('path');

const root = 'C:/Users/ddc2localadmin/aisdlctest/snip-demo';
process.chdir(root);

console.log('Running build-bundle.mjs to verify idempotent behavior...\n');

try {
  const output = execSync('node scripts/build-bundle.mjs', {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 10 * 1024 * 1024
  });

  const lines = output.split('\n').filter(l => l.trim());
  console.log('=== BUILD SCRIPT OUTPUT (last 10 lines) ===');
  lines.slice(-10).forEach(l => console.log(l));
  
  if (output.includes('No changes to commit') || output.includes('up-to-date')) {
    console.log('\n✓ IDEMPOTENT: Script correctly reports no changes when already built');
  } else if (output.includes('✓ No changes to commit') || output.includes('✓ No superproject changes')) {
    console.log('\n✓ IDEMPOTENT: No changes needed (bundle is current)');
  } else {
    console.log('\nNote: Rebuild may have occurred');
  }
} catch (e) {
  console.error('Error:', e.message);
  if (e.stdout) console.log(e.stdout.toString());
}
