import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

// Function to read title and body from README.md
async function getReadmeData() {
  const readmePath = path.join(process.cwd(), 'Readme.md');
  const content = await fs.readFile(readmePath, 'utf-8');

  const lines = content.split('\n');

  // Grab title as the first Markdown H1 line (# Title)
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';

  // The rest of the file will be the body
  const body = content.trim();

  return { title, body };
}

async function postToDevto() {
  const { title, body } = await getReadmeData();

  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEV_TO_API_KEY
    },
    body: JSON.stringify({
      article: {
        title: title,
        body_markdown: body,
        published: true,
        tags: ['tag1', 'tag2']
      }
    })
  });

  const data = await response.json();
  console.log(data);
}

postToDevto().catch(console.error);
