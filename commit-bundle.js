const { execSync } = require('child_process');
const path = require('path');

const ROOT = 'C:/Users/ddc2localadmin/aisdlctest/snip-demo';

try {
  process.chdir(ROOT);
  
  // Stage files
  execSync('git add scripts/build-bundle.mjs BUNDLE.md', { stdio: 'inherit' });
  
  // Commit
  execSync('git -c user.email=snip@bundle.local -c user.name="Snip Bundle" commit -m "feat: add bundle build system (build-bundle.mjs + BUNDLE.md)"', { stdio: 'inherit' });
  
  // Show status
  console.log('\n✓ Committed to main');
  execSync('git log --oneline -3', { stdio: 'inherit' });
  
  console.log('\n✓ Done! To push: git push origin main');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
