const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = path.resolve(__dirname, '..');
  console.log('Initializing git repository in:', dir);

  // 1. Git init
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('Initialized repository with default branch main.');

  // 2. Add remote
  try {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/ileshgarg/KeyArena.git'
    });
    console.log('Added remote origin: https://github.com/ileshgarg/KeyArena.git');
  } catch (err) {
    console.log('Remote already exists or error:', err.message);
  }

  // 3. Status matrix to find all unignored files and stage them
  console.log('Computing status matrix and staging files...');
  const matrix = await git.statusMatrix({
    fs,
    dir,
    filter: (f) => !f.startsWith('.git/')
  });

  let addedCount = 0;
  for (const [filepath, head, workdir, stage] of matrix) {
    // If file exists in workdir and is not ignored
    if (workdir === 1) {
      await git.add({ fs, dir, filepath });
      addedCount++;
    }
  }
  console.log(`Staged ${addedCount} files.`);

  // 4. Commit
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Ilesh Garg',
      email: 'ileshgarg@users.noreply.github.com'
    },
    message: 'Initial commit: KeyArena typing performance platform'
  });
  console.log('Committed successfully with SHA:', sha);
}

main().catch(err => {
  console.error('Git setup error:', err);
  process.exit(1);
});
