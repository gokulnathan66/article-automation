import path from 'path';
import fs from 'fs/promises';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// ES Modules __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads README.md and processes it for Dev.to
 */
async function getReadmeData() {
  const rootDir = process.env.USER_REPO_PATH || path.resolve(__dirname, '..');
  const contentPath = process.env.USER_CONTENT_PATH || 'content';
  
  // Multiple possible locations for README
  const possibleLocations = [
    path.join(rootDir, contentPath, 'README.md'),
    path.join(rootDir, contentPath, 'Readme.md'), 
    path.join(rootDir, contentPath, 'readme.md'),
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'Readme.md'),
    path.join(rootDir, 'readme.md')
  ];

  let filepath, content;

  // Find README.md file
  for (const location of possibleLocations) {
    try {
      filepath = location;
      content = await fs.readFile(filepath, 'utf-8');
      console.error(`✅ Found README at: ${filepath}`);
      break;
    } catch {}
  }
  
  if (!content) {
    throw new Error(`README file not found. Tried: ${possibleLocations.join(', ')}`);
  }

  // Get repo details from env vars provided by workflow
  const username = process.env.GITHUB_USERNAME || 'unknown-user';
  const repo = process.env.GITHUB_REPO || 'unknown-repo';
  const branch = process.env.GITHUB_BRANCH || 'main';

  function toRawGitHubUrl(relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${normalizedPath}`;
  }

  // Replace relative markdown images
  content = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (m, alt, imgPath) => {
    return `![${alt}](${toRawGitHubUrl(imgPath)})`;
  });

  // Replace HTML <img> tags with relative src
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

/**
 * Makes API requests to Dev.to
 */
async function makeDevToRequest(endpoint, options = {}) {
  const response = await fetch(`https://dev.to/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEV_TO_API_KEY,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dev.to API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets all user articles to find existing post by title
 */
async function findExistingPostByTitle(title) {
  try {
    console.error(`Searching for existing post with title: "${title}"`);
    const articles = await makeDevToRequest('/articles/me');
    
    const existingPost = articles.find(article => article.title.trim() === title.trim());
    
    if (existingPost) {
      console.error(`Found existing post: ${existingPost.id} - "${existingPost.title}"`);
    } else {
      console.error('No existing post found with matching title');
    }
    
    return existingPost;
  } catch (error) {
    console.error('Error searching for existing post:', error.message);
    return null;
  }
}

/**
 * Publishes a new article to Dev.to
 */
async function publishNewArticle(title, content, tags) {
  const article = {
    title,
    body_markdown: content,
    published: true,
  };

  if (tags && tags.length > 0) {
    article.tags = tags;
  }

  const result = await makeDevToRequest('/articles', {
    method: 'POST',
    body: JSON.stringify({ article }),
  });

  return result;
}

/**
 * Updates an existing article on Dev.to
 */
async function updateExistingArticle(articleId, title, content, tags) {
  const article = {
    title,
    body_markdown: content,
    published: true,
  };

  if (tags && tags.length > 0) {
    article.tags = tags;
  }

  const result = await makeDevToRequest(`/articles/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify({ article }),
  });

  return result;
}

/**
 * Validates if an ID looks like a Dev.to post ID
 */
function isValidDevToId(id) {
  return id && /^\d+$/.test(id.toString());
}

export async function postOrUpdateArticle({ existingEnv }) {
  const { title, body, tags } = await getReadmeData();

  let isUpdating = false;
  let existingPost = null;

  console.error(`Processing article: "${title}"`);

  if (existingEnv?.id && isValidDevToId(existingEnv.id)) {
    console.error(`Using saved Dev.to post ID: ${existingEnv.id}`);
    isUpdating = true;
    existingPost = { id: existingEnv.id };
  } else if (existingEnv?.id) {
    console.error(`Saved ID (${existingEnv.id}) appears to be from another platform, ignoring...`);
  }

  if (!existingPost) {
    existingPost = await findExistingPostByTitle(title);
    if (existingPost) {
      isUpdating = true;
    }
  }

  let postResult;

  try {
    if (isUpdating && existingPost) {
      console.error(`Updating existing post: ${existingPost.id}`);
      postResult = await updateExistingArticle(existingPost.id, title, body, tags);
    } else {
      console.error('Publishing new post');
      postResult = await publishNewArticle(title, body, tags);
    }

    const postDetails = {
      id: postResult.id,
      title: postResult.title,
      url: postResult.url,
      published_at: postResult.published_at,
      updated_at: postResult.edited_at || postResult.published_at,
      method: isUpdating ? 'UPDATE' : 'POST',
    };

    console.log(JSON.stringify(postDetails));
    return postDetails;

  } catch (error) {
    const errorDetails = {
      error: true,
      message: error.message || 'Unknown error',
      ...existingEnv,
    };
    console.error('Error posting/updating:', errorDetails.message);
    console.log(JSON.stringify(errorDetails));
    process.exit(1);
  }
}

async function main() {
  // Validate required environment variables
  if (!process.env.DEV_TO_API_KEY) {
    throw new Error('DEV_TO_API_KEY environment variable is required');
  }

  const userRepoPath = process.env.USER_REPO_PATH;
  const userContentPath = process.env.USER_CONTENT_PATH || 'content';
  
  console.error('Environment check:');
  console.error(`- DEV_TO_API_KEY: ${process.env.DEV_TO_API_KEY ? 'Set' : 'Not set'}`);
  console.error(`- USER_REPO_PATH: ${userRepoPath || 'Not set'}`);
  console.error(`- USER_CONTENT_PATH: ${userContentPath}`);

  const envVars = {
    id: process.env.DEV_TO_SAVED_POST_ID,
    title: process.env.DEV_TO_SAVED_POST_TITLE,
    url: process.env.DEV_TO_SAVED_POST_URL,
    published_at: process.env.DEV_TO_SAVED_POST_PUBLISHED_AT,
    updated_at: process.env.DEV_TO_SAVED_POST_UPDATED_AT,
  };
  
  const existingEnv = envVars.id ? envVars : null;
  
  if (existingEnv) {
    console.error('Found saved post data:', existingEnv);
  } else {
    console.error('No saved post data found, will check for existing posts by title');
  }
  
  await postOrUpdateArticle({ existingEnv });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
