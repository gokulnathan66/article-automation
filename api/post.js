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
  // Try different possible README file names (case-sensitive filesystems)
  const possibleReadmeFiles = ['README.md', 'Readme.md', 'readme.md'];
  let readmePath = null;
  let content = null;

  // Debug: show current working directory and list files
  console.log("Current working directory:", process.cwd());
  const rootDir = path.resolve(__dirname, '..');
  console.log("Looking for README in directory:", rootDir);
  
  try {
    const files = await fs.readdir(rootDir);
    console.log("Files in root directory:", files);
  } catch (error) {
    console.log("Could not list root directory:", error.message);
  }

  // Try to find the README file with different case variations
  for (const filename of possibleReadmeFiles) {
    const testPath = path.resolve(__dirname, '..', filename);
    try {
      console.log("Trying to read:", testPath);
      content = await fs.readFile(testPath, 'utf-8');
      readmePath = testPath;
      console.log("Successfully found README at:", readmePath);
      break;
    } catch (error) {
      console.log(`File ${filename} not found, trying next...`);
    }
  }

  if (!content) {
    throw new Error(`README file not found. Tried: ${possibleReadmeFiles.join(', ')}`);
  }

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
