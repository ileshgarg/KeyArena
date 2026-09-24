const fs = require('fs');
const path = require('path');

const token = process.argv[2] || process.env.GITHUB_TOKEN;
const repo = 'ileshgarg/KeyArena';

async function main() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'KeyArena-SyncChecker'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Fetch remote commit on main
  console.log(`Checking GitHub repository https://github.com/${repo}...`);
  const branchRes = await fetch(`https://api.github.com/repos/${repo}/branches/main`, { headers });
  if (!branchRes.ok) {
    throw new Error(`Failed to fetch branch: ${branchRes.status} ${await branchRes.text()}`);
  }
  const branchData = await branchRes.json();
  const commitSha = branchData.commit.sha;
  const treeSha = branchData.commit.commit.tree.sha;
  console.log(`Remote branch 'main' commit: ${commitSha.slice(0, 7)} - "${branchData.commit.commit.message.trim()}"`);

  // 2. Fetch full remote tree
  const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${treeSha}?recursive=1`, { headers });
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch tree: ${treeRes.status} ${await treeRes.text()}`);
  }
  const treeData = await treeRes.json();
  const remoteFiles = new Map();
  for (const item of treeData.tree) {
    if (item.type === 'blob') {
      remoteFiles.set(item.path, item.sha);
    }
  }
  console.log(`Total files stored on GitHub: ${remoteFiles.size}`);

  // 3. Scan local workspace files
  const rootDir = path.resolve(__dirname, '..');
  function getAllLocalFiles(dir, fileList = [], baseDir = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      // Standard project exclusions
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
        getAllLocalFiles(fullPath, fileList, baseDir);
      } else {
        fileList.push(relPath);
      }
    }
    return fileList;
  }

  const localFiles = getAllLocalFiles(rootDir);
  console.log(`Total eligible project files on local disk: ${localFiles.length}`);

  const missingOnRemote = [];
  for (const f of localFiles) {
    if (!remoteFiles.has(f)) {
      missingOnRemote.push(f);
    }
  }

  const missingOnLocal = [];
  for (const [f] of remoteFiles) {
    if (!fs.existsSync(path.join(rootDir, f))) {
      missingOnLocal.push(f);
    }
  }

  console.log('\n================ SYNC AUDIT REPORT ================');
  if (missingOnRemote.length === 0 && missingOnLocal.length === 0) {
    console.log('✅ ALL LOCAL FILES ARE FULLY UPLOADED AND SYNCHRONIZED WITH GITHUB!');
    console.log(`   Count: ${localFiles.length} files exactly match between local and remote.`);
  } else {
    if (missingOnRemote.length > 0) {
      console.log(`❌ ${missingOnRemote.length} local files NOT uploaded to GitHub:`);
      missingOnRemote.forEach(f => console.log('   +', f));
    }
    if (missingOnLocal.length > 0) {
      console.log(`⚠️ ${missingOnLocal.length} remote files not found on local disk:`);
      missingOnLocal.forEach(f => console.log('   -', f));
    }
  }
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
