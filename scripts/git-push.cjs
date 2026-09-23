const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = path.resolve(__dirname, '..');
  const token = process.env.GITHUB_TOKEN || process.argv[2];

  console.log('Attempting push to origin (https://github.com/ileshgarg/KeyArena.git)...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => {
        if (!token) {
          console.log('GitHub authentication requested: No token provided.');
          return undefined;
        }
        return { username: token };
      }
    });

    console.log('Push result:', JSON.stringify(pushResult, null, 2));
    if (pushResult.ok) {
      console.log('SUCCESS: Repository successfully pushed to GitHub!');
    }
  } catch (err) {
    console.error('Push error:', err.message);
    if (err.data) console.error('Error data:', err.data);
    process.exit(1);
  }
}

main();
