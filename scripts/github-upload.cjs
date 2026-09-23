const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN || process.argv[2];
if (!token) {
  console.error('Error: Please provide a GitHub Personal Access Token.');
  console.error('Usage: node scripts/github-upload.cjs <YOUR_GITHUB_TOKEN>');
  process.exit(1);
}

const OWNER = 'ileshgarg';
const REPO = 'KeyArena';
const BRANCH = 'main';

async function ghFetch(url, options = {}, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'KeyArena-Uploader',
          ...(options.headers || {})
        }
      });
      if (!res.ok) {
        const text = await res.text();
        const err = new Error(`GitHub API Error (${res.status} ${res.statusText}): ${text}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    } catch (err) {
      if (err.status || attempt === retries) {
        throw err;
      }
      console.log(`Network request failed (${err.message}). Retrying in 2s (attempt ${attempt}/${retries})...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

function getAllFiles(dir, fileList = [], baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    // Skip ignored paths
    if (
      relPath.startsWith('.git') ||
      relPath.startsWith('node_modules') ||
      relPath.startsWith('.next') ||
      relPath.startsWith('dist') ||
      relPath.startsWith('out') ||
      relPath.startsWith('coverage') ||
      relPath.includes('.env.local')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList, baseDir);
    } else if (entry.isFile()) {
      fileList.push({ relPath, fullPath });
    }
  }
  return fileList;
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  console.log(`Scanning files in ${rootDir}...`);
  const files = getAllFiles(rootDir);
  console.log(`Found ${files.length} files to upload.`);

  // 1. Check if repo is empty or if branch exists
  let parentCommitSha = null;
  let baseTreeSha = null;

  try {
    const refData = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    parentCommitSha = refData.object.sha;
    const commitData = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${parentCommitSha}`);
    baseTreeSha = commitData.tree.sha;
    console.log(`Found existing branch ${BRANCH} (latest commit: ${parentCommitSha.slice(0, 7)})`);
  } catch (err) {
    if (err.status === 404) {
      console.log(`Branch ${BRANCH} does not exist or repository is empty. Initializing repository...`);
      const readmePath = path.join(rootDir, 'README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      const initRes = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/README.md`, {
        method: 'PUT',
        body: JSON.stringify({
          message: 'Initial repository setup',
          content: Buffer.from(readmeContent).toString('base64'),
          branch: BRANCH
        })
      });
      parentCommitSha = initRes.commit.sha;
      const commitData = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${parentCommitSha}`);
      baseTreeSha = commitData.tree.sha;
      console.log(`Initialized repo with initial commit: ${parentCommitSha.slice(0, 7)}`);
    } else {
      throw err;
    }
  }

  // 2. Upload blobs for each file
  console.log('Creating Git blobs for all files...');
  const treeItems = [];
  for (let i = 0; i < files.length; i++) {
    const { relPath, fullPath } = files[i];
    const content = fs.readFileSync(fullPath);
    const base64Content = content.toString('base64');

    const blobData = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: base64Content,
        encoding: 'base64'
      })
    });

    treeItems.push({
      path: relPath,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha
    });

    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      console.log(`Progress: ${i + 1}/${files.length} blobs uploaded.`);
    }
  }

  // 3. Create tree (omit base_tree so deleted files are pruned from the repository)
  console.log('Creating Git tree...');
  const treePayload = {
    tree: treeItems
  };
  const treeData = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify(treePayload)
  });
  console.log('Created tree SHA:', treeData.sha);

  // 4. Create commit
  console.log('Creating commit...');
  const commitMessage = process.argv[3] || 'Remove multiplayer and simplify architecture';
  const commitPayload = {
    message: commitMessage,
    tree: treeData.sha,
    parents: [parentCommitSha]
  };
  const newCommit = await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify(commitPayload)
  });
  console.log('Created commit SHA:', newCommit.sha);

  // 5. Update branch reference to point to new commit
  console.log(`Updating ref refs/heads/${BRANCH}...`);
  await ghFetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommit.sha,
      force: true
    })
  });

  console.log('\n==================================================');
  console.log('🚀 SUCCESS! All files have been uploaded to GitHub:');
  console.log(`https://github.com/${OWNER}/${REPO}`);
  console.log('==================================================');
}

main().catch(err => {
  console.error('\nUpload error:', err.message);
  process.exit(1);
});
