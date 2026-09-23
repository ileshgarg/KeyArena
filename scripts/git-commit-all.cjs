const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = path.resolve(__dirname, '..');
  
  const matrix = await git.statusMatrix({ fs, dir });
  console.log(`Found ${matrix.length} candidate files.`);

  let staged = 0;
  for (const [filepath, head, workdir, stage] of matrix) {
    if (workdir >= 1) {
      await git.add({ fs, dir, filepath });
      staged++;
    }
  }
  console.log(`Successfully staged ${staged} files.`);

  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Ilesh Garg',
      email: 'ileshgarg@users.noreply.github.com'
    },
    message: 'Initial commit: KeyArena typing performance platform'
  });
  console.log('Committed commit SHA:', sha);

  const log = await git.log({ fs, dir, depth: 5 });
  console.log('Recent commits:', log.map(c => ({ oid: c.oid.slice(0, 7), message: c.commit.message })));
}

main().catch(err => {
  console.error('Commit failed:', err);
  process.exit(1);
});
