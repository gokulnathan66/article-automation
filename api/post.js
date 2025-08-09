import path from 'path';
import fs from 'fs/promises';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// ES Modules __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads README.md, replaces relative image paths with raw GitHub URLs
 * using repo info passed from the workflow via env variables.
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

  // Regex to find markdown images that are relative paths
  const imageRegex = /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g;

  const fixedContent = content.replace(imageRegex, (match, altText, imagePath) => {
    const normalizedPath = imagePath.replace(/\\/g, '/');
    const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${normalizedPath}`;
    return `![${altText}](${rawUrl})`;
  });

  // Extract title from first H1
  const titleLine = fixedContent.split('\n').find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';

  return { title, body: fixedContent.trim() };
}

export async function postOrUpdateArticle({ existingEnv }) {
  const { title, body } = await getReadmeData();

  const isUpdating = !!existingEnv?.id;
  const apiUrl = isUpdating
    ? `https://dev.to/api/articles/${existingEnv.id}`
    : `https://dev.to/api/articles`;
  const method = isUpdating ? 'PUT' : 'POST';

  const response = await fetch(apiUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEV_TO_API_KEY,
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: body,
        published: true,
        tags: ['tag1', 'tag2'],
      },
    }),
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
    id: process.env.SAVED_POST_ID,
    title: process.env.SAVED_POST_TITLE,
    url: process.env.SAVED_POST_URL,
    published_at: process.env.SAVED_POST_PUBLISHED_AT,
    updated_at: process.env.SAVED_POST_UPDATED_AT,
  };
  const existingEnv = envVars.id ? envVars : null;
  await postOrUpdateArticle({ existingEnv });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
