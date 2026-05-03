const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { analyzeRepo } = require('../services/githubService');
const { buildRepoSystemDesignPrompt, buildRepoDevOpsPrompt, buildDeployAssistantPrompt, buildChatSystemPrompt } = require('../services/promptTemplates');
const Repo = require('../models/Repo');
const User = require('../models/User');

const parseAI = (raw) => {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');
  
  let jsonString = match[0];
  let result;
  
  try {
    result = JSON.parse(jsonString);
  } catch (err) {
    // Attempt to fix literal newlines inside JSON strings which break JSON.parse
    try {
      // This regex looks for newlines that are NOT followed by a " or } or ] that would end a value
      const fixedJson = jsonString.replace(/\n(?!(?:[^"]*"[^"]*")*[^"]*$)/g, '\\n');
      result = JSON.parse(fixedJson);
    } catch {
      throw new Error('AI returned malformed response. Please retry.');
    }
  }
  
  // Auto-sanitize mermaidDiagram if it exists
  if (result.mermaidDiagram) {
    result.mermaidDiagram = result.mermaidDiagram
      .replace(/\|>/g, '|')
      .replace(/;\s*(?=[A-Za-z])/g, '\n')
      .replace(/->>/g, '-->')
      .trim();
  }
  return result;
};

// POST /api/github/import — fetch repo info + key files
const importRepo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { repoUrl } = req.body;

    // Get user's GitHub token if they logged in via GitHub
    const user = await User.findById(req.user.id).select('+githubAccessToken');
    let token = user?.githubAccessToken || process.env.GITHUB_TOKEN || null;
    
    // Ignore placeholder tokens so public repos can still be fetched without a 401 Unauthorized error
    if (token) {
      const t = String(token).trim();
      if (t === 'your_github_pat_here' || t === '' || t === 'null' || t === 'undefined') {
        token = null;
      }
    }

    const repoData = await analyzeRepo(repoUrl, token);

    // Upsert repo record
    const repo = await Repo.findOneAndUpdate(
      { user: req.user.id, fullName: repoData.info.fullName },
      {
        user: req.user.id,
        repoUrl,
        owner: repoData.owner,
        name: repoData.info.name,
        fullName: repoData.info.fullName,
        description: repoData.info.description,
        language: repoData.info.language,
        stars: repoData.info.stars,
        structure: { dirs: repoData.dirs, files: repoData.files },
        keyFiles: repoData.keyFiles,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        id: repo._id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        dirs: repoData.dirs,
        fileCount: repoData.files.length,
        keyFilesFound: Object.keys(repoData.keyFiles),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/github/repos/:repoId/system-design
const generateSystemDesign = async (req, res, next) => {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, user: req.user.id });
    if (!repo) return res.status(404).json({ success: false, message: 'Repo not found' });

    const { system, user } = buildRepoSystemDesignPrompt({
      info: { fullName: repo.fullName, description: repo.description, language: repo.language },
      dirs: repo.structure?.dirs || [],
      keyFiles: repo.keyFiles || {},
    });

    const raw = await callGroq(user, system, [], true);
    let result;
    try { result = parseAI(raw); }
    catch { return res.status(502).json({ success: false, message: 'AI returned malformed response. Please retry.' }); }

    repo.systemDesign = result;
    await repo.save();

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/github/repos/:repoId/devops
const generateDevOps = async (req, res, next) => {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, user: req.user.id });
    if (!repo) return res.status(404).json({ success: false, message: 'Repo not found' });

    const { system, user } = buildRepoDevOpsPrompt({
      info: { fullName: repo.fullName, description: repo.description, language: repo.language },
      dirs: repo.structure?.dirs || [],
      keyFiles: repo.keyFiles || {},
    });

    const raw = await callGroq(user, system, [], true);
    let result;
    try { result = parseAI(raw); }
    catch { return res.status(502).json({ success: false, message: 'AI returned malformed response. Please retry.' }); }

    repo.devopsPipeline = result;
    await repo.save();

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/github/repos/:repoId/deploy-chat
const deployChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const repo = await Repo.findOne({ _id: req.params.repoId, user: req.user.id });
    if (!repo) return res.status(404).json({ success: false, message: 'Repo not found' });

    const systemPrompt = buildDeployAssistantPrompt({
      fullName: repo.fullName,
      detectedStack: repo.systemDesign?.detectedStack || repo.devopsPipeline?.detectedStack,
      language: repo.language,
      description: repo.description,
      structure: repo.structure?.dirs || [],
      keyFiles: Object.keys(repo.keyFiles || {}),
    });

    const sanitizedHistory = history.slice(-10).map(({ role, content }) => ({ role, content }));
    const reply = await callGroq(message, systemPrompt, sanitizedHistory);

    res.json({ success: true, data: { reply } });
  } catch (err) { next(err); }
};

// GET /api/github/repos — list user's imported repos (from DB)
const listRepos = async (req, res, next) => {
  try {
    const repos = await Repo.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select('name fullName description language stars systemDesign devopsPipeline updatedAt');
    res.json({ success: true, data: repos });
  } catch (err) { next(err); }
};

// GET /api/github/user-repos — fetch repos directly from GitHub API
const axios = require('axios');
const listGitHubUserRepos = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+githubAccessToken');
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ success: false, message: 'GitHub not connected' });
    }

    const { data } = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${user.githubAccessToken}` },
      params: { sort: 'updated', per_page: 30 }
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('[github] Fetch User Repos Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch repositories from GitHub' });
  }
};

// GET /api/github/repos/:repoId
const getRepo = async (req, res, next) => {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, user: req.user.id });
    if (!repo) return res.status(404).json({ success: false, message: 'Repo not found' });
    res.json({ success: true, data: repo });
  } catch (err) { next(err); }
};

// POST /api/github/repos/:repoId/auto-generate — run system design + devops in parallel
const autoGenerate = async (req, res, next) => {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, user: req.user.id });
    if (!repo) return res.status(404).json({ success: false, message: 'Repo not found' });

    const context = {
      info: { fullName: repo.fullName, description: repo.description, language: repo.language },
      dirs: repo.structure?.dirs || [],
      keyFiles: repo.keyFiles || {},
    };

    const [sdResult, doResult] = await Promise.allSettled([
      (async () => {
        const { system, user } = buildRepoSystemDesignPrompt(context);
        const raw = await callGroq(user, system, [], true);
        return parseAI(raw);
      })(),
      (async () => {
        const { system, user } = buildRepoDevOpsPrompt(context);
        const raw = await callGroq(user, system, [], true);
        return parseAI(raw);
      })(),
    ]);

    if (sdResult.status === 'fulfilled') {
      repo.systemDesign = sdResult.value;
    }
    if (doResult.status === 'fulfilled') {
      repo.devopsPipeline = doResult.value;
    }
    await repo.save();

    res.json({
      success: true,
      data: {
        systemDesign: sdResult.status === 'fulfilled' ? sdResult.value : null,
        devopsPipeline: doResult.status === 'fulfilled' ? doResult.value : null,
        errors: {
          systemDesign: sdResult.status === 'rejected' ? sdResult.reason?.message : null,
          devopsPipeline: doResult.status === 'rejected' ? doResult.reason?.message : null,
        },
      },
    });
  } catch (err) { next(err); }
};

module.exports = { importRepo, generateSystemDesign, generateDevOps, deployChat, listRepos, listGitHubUserRepos, getRepo, autoGenerate };
