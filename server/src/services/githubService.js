const axios = require('axios');

// Key files to fetch content for (language-agnostic important files)
const KEY_FILE_PATTERNS = [
  'package.json', 'requirements.txt', 'Pipfile', 'go.mod', 'pom.xml', 'build.gradle',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.github/workflows', 'README.md', 'readme.md',
  'src/index.js', 'src/app.js', 'src/main.js', 'src/server.js', 'server.js', 'app.js', 'index.js',
  'src/main.py', 'main.py', 'app.py', 'manage.py',
  'src/main.go', 'main.go',
];

const githubApi = (token) =>
  axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 15000,
  });

const parseRepoUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s]+?)(?:\.git)?(?:\/|$)/);
  if (!match) throw new Error('Invalid GitHub URL. Format: https://github.com/owner/repo');
  return { owner: match[1], repo: match[2] };
};

const fetchRepoInfo = async (owner, repo, token) => {
  const api = githubApi(token);
  const { data } = await api.get(`/repos/${owner}/${repo}`);
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description || '',
    language: data.language || '',
    stars: data.stargazers_count,
    defaultBranch: data.default_branch,
    topics: data.topics || [],
  };
};

const fetchFileTree = async (owner, repo, branch, token) => {
  const api = githubApi(token);
  try {
    const { data } = await api.get(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    return data.tree
      .filter((f) => f.type === 'blob')
      .map((f) => f.path)
      .slice(0, 300); // cap at 300 files
  } catch {
    return [];
  }
};

const fetchFileContent = async (owner, repo, path, token) => {
  const api = githubApi(token);
  try {
    const { data } = await api.get(`/repos/${owner}/${repo}/contents/${path}`);
    if (data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return content.slice(0, 3000); // cap each file at 3000 chars
    }
    return null;
  } catch {
    return null;
  }
};

const fetchKeyFiles = async (owner, repo, files, token) => {
  const keyFiles = {};

  // Find which key files exist in the repo
  const filesToFetch = KEY_FILE_PATTERNS.filter((pattern) =>
    files.some((f) => f === pattern || f.startsWith(pattern))
  ).slice(0, 10); // max 10 files

  await Promise.all(
    filesToFetch.map(async (pattern) => {
      const match = files.find((f) => f === pattern || f.startsWith(pattern));
      if (match) {
        const content = await fetchFileContent(owner, repo, match, token);
        if (content) keyFiles[match] = content;
      }
    })
  );

  return keyFiles;
};

const analyzeRepo = async (repoUrl, userToken) => {
  const { owner, repo } = parseRepoUrl(repoUrl);

  const [info, ] = await Promise.all([fetchRepoInfo(owner, repo, userToken)]);
  const files = await fetchFileTree(owner, repo, info.defaultBranch, userToken);
  const keyFiles = await fetchKeyFiles(owner, repo, files, userToken);

  // Build a directory structure summary
  const dirs = [...new Set(files.map((f) => f.split('/')[0]))].slice(0, 30);

  return { owner, info, files: files.slice(0, 150), dirs, keyFiles };
};

module.exports = { analyzeRepo, parseRepoUrl };
