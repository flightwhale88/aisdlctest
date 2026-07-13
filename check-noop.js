const { execSync } = require('child_process');
process.chdir('C:/Users/ddc2localadmin/aisdlctest/snip-demo/bundle');

try {
  const output = execSync('node ../scripts/build-bundle.mjs', {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 50 * 1024 * 1024
  });

  const lines = output.split('\n').filter(l => l.trim());
  console.log('=== BUILD SCRIPT OUTPUT (last 25 lines) ===\n');
  lines.slice(-25).forEach(l => console.log(l));

  if (output.includes('No changes')) {
    console.log('\n✓ IDEMPOTENT: Script correctly reports no changes');
  } else if (output.includes('up-to-date') || output.includes('unchanged')) {
    console.log('\n✓ IDEMPOTENT: No changes to commit');
  }
} catch (e) {
  console.error('Error:', e.message);
  if (e.stdout) console.log('\nOutput:', e.stdout.toString());
}
