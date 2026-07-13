#!/usr/bin/env node
const { execSync } = require('child_process');
process.chdir('C:/Users/ddc2localadmin/aisdlctest/snip-demo');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log('Current status:\n', status || '(clean)');
  
  if (status.includes('scripts/build-bundle.mjs') || status.includes('BUNDLE.md')) {
    console.log('\nStaging files...');
    execSync('git add scripts/build-bundle.mjs BUNDLE.md');
    
    console.log('Committing...');
    execSync('git -c user.email=snip@bundle.local -c user.name="Snip Bundle" commit -m "feat: add bundle build system"');
    
    console.log('\nRecent commits:');
    execSync('git log --oneline -3');
  }
} catch (e) {
  console.error('Error:', e.message);
}
