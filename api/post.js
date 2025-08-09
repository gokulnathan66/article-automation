import path from 'path';
import fs from 'fs/promises';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// --- ES module __dirname support ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Utility: Try multiple README file names ---
async function getReadmeData() {
  const rootDir = path.resolve(__dirname, '..');
  const possibleFiles = ['README.md', 'Readme.md', 'readme.md'];

  for (const filename of possibleFiles) {
    try {
      const filepath = path.join(rootDir, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const titleLine = content.split('\n').find(line => line.startsWith('# '));
      const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';
      return { title, body: content.trim() };
    } catch {}
  }
  throw new Error(`README file not found. Searched: ${possibleFiles.join(', ')}`);
}

// --- Core logic: Post or update ---
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
    console.log(JSON.stringify(postDetails)); // for workflow step
    return postDetails;
  } else {
    // Error output for debugging and workflow
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

// --- Entrypoint: Reads current env vars if present ---
async function main() {
  // Try to read env variables (for update path)
  const envVars = {
    id: process.env.SAVED_POST_ID,
    title: process.env.SAVED_POST_TITLE,
    url: process.env.SAVED_POST_URL,
    published_at: process.env.SAVED_POST_PUBLISHED_AT,
    updated_at: process.env.SAVED_POST_UPDATED_AT,
  };
  // Only pass non-null if id is present
  const existingEnv = envVars.id ? envVars : null;
  await postOrUpdateArticle({ existingEnv });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
