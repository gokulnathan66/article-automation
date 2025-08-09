import path from 'path';
import fs from 'fs/promises';
import 'dotenv/config';

// Removed savedPostFile and related file read/write functions,
// because we won't use savedPost.json anymore.

// You can optionally keep this if you want to read from a local file outside GitHub Actions,
// but in the GitHub Actions context, you should rely on env vars instead.

async function getSavedPostDetailsFromEnv() {
  // Read saved post details from environment variables if set
  // (This makes your script flexible to run locally with file, or in CI with env)
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
  const readmePath = path.join(process.cwd(), 'README.md');
  const content = await fs.readFile(readmePath, 'utf-8');

  const lines = content.split('\n');
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';
  const body = content.trim();

  return { title, body };
}

async function postOrUpdateArticle() {
  // Try to read from env first (for GitHub Actions)
  const savedPost = await getSavedPostDetailsFromEnv();

  // Or fallback to reading from json file (for local testing)
  // Comment this out if you want to disable file usage
  // if (!savedPost) {
  //   savedPost = await getSavedPostDetailsFromFile();
  // }

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
        tags: ['tag1', 'tag2'], // Optional: you can enhance tag extraction
      },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    // Instead of saving to a file, output JSON to stdout for GitHub Actions
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
    process.exit(1);
  }
}

postOrUpdateArticle().catch(error => {
  console.error(error);
  process.exit(1);
});
