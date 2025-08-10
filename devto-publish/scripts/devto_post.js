import path from 'path';
import fs from 'fs/promises';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// ES Modules __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads README.md and replaces relative links with raw GitHub URLs.
 * Also extracts tags from the end of the README if present.
 */
async function getReadmeData() {
  const rootDir = path.resolve(__dirname, '..');
  const possibleFiles = ['README.md', 'Readme.md', 'readme.md'];

  let filepath, content;

  // Find README.md file
  for (const filename of possibleFiles) {
    try {
      filepath = path.join(rootDir, filename);
      content = await fs.readFile(filepath, 'utf-8');
      break;
    } catch {}
  }
  if (!content) {
    throw new Error(`README file not found. Tried: ${possibleFiles.join(', ')}`);
  }

  // Get repo details from env vars provided by workflow
  const username = process.env.GITHUB_USERNAME || 'unknown-user';
  const repo = process.env.GITHUB_REPO || 'unknown-repo';
  const branch = process.env.GITHUB_BRANCH || 'main';

  function toRawGitHubUrl(relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${normalizedPath}`;
  }

  // 1. Replace relative markdown images
  content = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (m, alt, imgPath) => {
    return `![${alt}](${toRawGitHubUrl(imgPath)})`;
  });

  // 2. Replace relative markdown links for certain file types
  const fileExts = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'mp4', 'webm', 'ogg', 'mp3', 'wav',
    'svg', 'ttf', 'woff', 'woff2'
  ];
  const extPattern = fileExts.join('|');
  const mdLinkRegex = new RegExp(`\\[([^\\]]+)\\]\\((?!https?:\/\/)([^)]+\\.(${extPattern}))\\)`, 'gi');
  content = content.replace(mdLinkRegex, (m, text, fPath) => {
    return `[${text}](${toRawGitHubUrl(fPath)})`;
  });

  // 3. Replace HTML <img> tags with relative src
  content = content.replace(/<img\s+([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']([^>]*?)>/gi,
    (m, before, srcPath, after) => {
      return `<img ${before}src="${toRawGitHubUrl(srcPath)}"${after}>`;
    });

  // Extract title from first # heading
  const titleLine = content.split('\n').find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';

  // Extract tags from a line starting with "TAGS:" or "Tags:"
  let tags;
  const tagLine = content.split('\n')
    .map(line => line.trim())
    .find(line => /^tags?:/i.test(line));
  if (tagLine) {
    const tagString = tagLine.split(':')[1] || '';
    tags = tagString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    if (tags.length === 0) {
      tags = undefined;
    }
  }

  return { title, body: content.trim(), tags };
}

export async function postOrUpdateArticle({ existingEnv }) {
  const { title, body, tags } = await getReadmeData();

  const isUpdating = !!existingEnv?.id;
  const apiUrl = isUpdating
    ? `https://dev.to/api/articles/${existingEnv.id}`
    : `https://dev.to/api/articles`;
  const method = isUpdating ? 'PUT' : 'POST';

  // Build the article payload dynamically
  const articleData = {
    title,
    body_markdown: body,
    published: true
  };
  if (tags && tags.length > 0) {
    articleData.tags = tags;
  }

  const response = await fetch(apiUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEV_TO_API_KEY,
    },
    body: JSON.stringify({ article: articleData }),
  });

  const data = await response.json();

  if (response.ok) {
    const postDetails = {
      id: data.id,
      title: data.title,
      url: data.url,
      published_at: data.published_at,
      updated_at: data.edited_at,
      method,
    };
    console.log(JSON.stringify(postDetails));
    return postDetails;
  } else {
    const errorDetails = {
      error: true,
      message: data.error || response.statusText || 'Unknown error',
      status: response.status,
      ...existingEnv,
    };
    console.error('Error posting/updating:', errorDetails.message);
    console.log(JSON.stringify(errorDetails));
    process.exit(1);
  }
}

async function main() {
  const envVars = {
    id: process.env.DEV_TO_SAVED_POST_ID,
    title: process.env.DEV_TO_SAVED_POST_TITLE,
    url: process.env.DEV_TO_SAVED_POST_URL,
    published_at: process.env.DEV_TO_SAVED_POST_PUBLISHED_AT,
    updated_at: process.env.DEV_TO_SAVED_POST_UPDATED_AT,
  };
  const existingEnv = envVars.id ? envVars : null;
  await postOrUpdateArticle({ existingEnv });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
