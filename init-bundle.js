const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmp = 'C:/tmp/snip-bundle-init';
const git = 'C:/Program Files/Git/cmd/git.exe';
const repo = 'https://github.com/flightwhale88/aisdlctest/';

// cleanup
try { execSync(`rmdir /s /q "${tmp}"`, { shell: 'cmd.exe', stdio: 'ignore' }); } catch {}

// clone
execSync(`"${git}" clone ${repo} "${tmp}"`, { stdio: 'inherit' });

// create orphan bundle branch
process.chdir(tmp);
execSync(`"${git}" checkout --orphan bundle`, { stdio: 'inherit' });
execSync(`"${git}" rm -rf .`, { stdio: 'inherit' });

// write README
fs.writeFileSync('README.md', `# bundle

Generated output — do not hand-edit.

See ../scripts/build-bundle.mjs for the build process.
`);

// commit
execSync(`"${git}" add README.md`, { stdio: 'inherit' });
execSync(`"${git}" -c user.email=test@test.com -c user.name=Test commit -m "init: bundle branch (generated)"`, { stdio: 'inherit' });

// push
execSync(`"${git}" push -u origin bundle:bundle`, { stdio: 'inherit' });

// cleanup
process.chdir('C:/Users/ddc2localadmin/aisdlctest/snip-demo');
execSync(`rmdir /s /q "${tmp}"`, { shell: 'cmd.exe', stdio: 'ignore' });

console.log('✓ bundle branch created and pushed');
