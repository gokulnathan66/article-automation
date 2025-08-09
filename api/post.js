import path from 'path';
import fs from 'fs/promises';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// Fix for ES modules: get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optionally, allow loading saved post from env (for "update" capability)
async function getSavedPostDetailsFromEnv() {
  if (process.env.SAVED_POST_ID) {
    return {
      id: process.env.SAVED_POST_ID,
      title: process.env.SAVED_POST_TITLE,
      url: process.env.SAVED_POST_URL,
      published_at: process.env.SAVED_POST_PUBLISHED_AT,
      updated_at: process.env.SAVED_POST_UPDATED_AT,
    };
  }
  return null;
}

async function getReadmeData() {
  const readmePath = path.resolve(__dirname, '..', 'README.md');
  console.log("Reading README from:", readmePath);
  const content = await fs.readFile(readmePath, 'utf-8');

  const lines = content.split('\n');
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';
  const body = content.trim();

  return { title, body };
}

async function postOrUpdateArticle() {
  // Try to get existing post data from environment
  const savedPost = await getSavedPostDetailsFromEnv();
  const { title, body } = await getReadmeData();

  const method = savedPost ? 'PUT' : 'POST';
  const url = savedPost
    ? `https://dev.to/api/articles/${savedPost.id}`
    : 'https://dev.to/api/articles';

  const response = await fetch(url, {
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
        tags: ['tag1', 'tag2'], // You can customize/extract tags if needed
      },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    // Output post details as JSON for the workflow to read and export
    const postDetails = {
      id: data.id,
      title: data.title,
      url: data.url,
      published_at: data.published_at,
      updated_at: data.edited_at,
    };
    console.log(JSON.stringify(postDetails));
  } else {
    console.error('Error posting/updating article:', data);
    process.exit(1); // Fail workflow step
  }
}

postOrUpdateArticle().catch(error => {
  console.error(error);
  process.exit(1); // Fail workflow step
});
