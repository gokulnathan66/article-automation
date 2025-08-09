import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

const savedPostFile = path.join(process.cwd(), 'savedPost.json');

async function savePostDetails(data) {
  await fs.writeFile(savedPostFile, JSON.stringify(data, null, 2), 'utf-8');
}

async function getSavedPostDetails() {
  try {
    const data = await fs.readFile(savedPostFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null; // No saved post yet
  }
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
  const savedPost = await getSavedPostDetails();
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
        tags: ['tag1', 'tag2'], // Optionally extend to auto-extract tags later
      },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    // Save post details if published successfully
    await savePostDetails({
      id: data.id,
      title: data.title,
      url: data.url,
      published_at: data.published_at,
      updated_at: data.edited_at,
    });
    console.log(`Article ${method === 'POST' ? 'created' : 'updated'} successfully!`);
    console.log('Post URL:', data.url);
  } else {
    console.error('Error posting/updating article:', data);
  }
}

postOrUpdateArticle().catch(console.error);
