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
  // Use environment variable if available, fallback to relative path
  const rootDir = process.env.USER_REPO_PATH || path.resolve(__dirname, '..');
  const contentPath = process.env.USER_CONTENT_PATH || '';
  
  console.error(`🔍 Looking for README in: ${rootDir}`);
  console.error(`🔍 Content path: ${contentPath}`);
  
  // Multiple possible locations for README
  const possibleLocations = [
    path.join(rootDir, contentPath, 'README.md'),
    path.join(rootDir, contentPath, 'Readme.md'), 
    path.join(rootDir, contentPath, 'readme.md'),
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'Readme.md'),
    path.join(rootDir, 'readme.md')
  ].filter(Boolean); // Remove empty paths

  let filepath, content;

  // Find README.md file
  for (const location of possibleLocations) {
    try {
      filepath = location;
      content = await fs.readFile(filepath, 'utf-8');
      console.error(`✅ Found README at: ${filepath}`);
      break;
    } catch (error) {
      console.error(`❌ Not found at: ${location}`);
    }
  }
  
  if (!content) {
    throw new Error(`README file not found. Tried: ${possibleLocations.join(', ')}`);
  }

  // Get repo details from env vars provided by workflow
  const username = process.env.GITHUB_USERNAME || 'unknown-user';
  const repo = process.env.GITHUB_REPO || 'unknown-repo';
  const branch = process.env.GITHUB_BRANCH || 'main';

  console.error(`📋 Repository: ${username}/${repo} (branch: ${branch})`);

  function toRawGitHubUrl(relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${normalizedPath}`;
  }

  // Replace relative markdown images
  content = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (m, alt, imgPath) => {
    const newUrl = `![${alt}](${toRawGitHubUrl(imgPath)})`;
    console.error(`🔄 Replaced image: ${imgPath} -> ${toRawGitHubUrl(imgPath)}`);
    return newUrl;
  });

  // Replace relative markdown links for certain file types
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

  // Replace HTML <img> tags with relative src
  content = content.replace(/<img\s+([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']([^>]*?)>/gi,
    (m, before, srcPath, after) => {
      const newUrl = `<img ${before}src="${toRawGitHubUrl(srcPath)}"${after}>`;
      console.error(`🔄 Replaced HTML image: ${srcPath} -> ${toRawGitHubUrl(srcPath)}`);
      return newUrl;
    });

  // Remove badges for Dev.to (they don't render well on Dev.to)
  console.error('🧹 Removing badges for Dev.to compatibility...');
  
  // Remove shields.io badges (both linked and unlinked)
  content = content.replace(/\[?\!\[[^\]]*\]\(https:\/\/img\.shields\.io\/[^)]+\)\]?(\([^)]+\))?/g, '');
  
  // Remove custom badge lines that might contain multiple badges
  content = content.replace(/^.*img\.shields\.io.*$/gm, '');
  
  // Clean up empty lines left by badge removal
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  console.error('✅ Badges removed for Dev.to');

  // Extract title from first # heading
  const titleLine = content.split('\n').find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : 'Untitled Post';

  console.error(`📝 Extracted title: "${title}"`);

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
    console.error(`🏷️ Extracted tags: ${tags ? tags.join(', ') : 'none'}`);
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

  console.error(`🚀 Processing article: "${title}"`);
  console.error(`📡 API URL: ${apiUrl}`);
  console.error(`🔧 Method: ${method}`);

  // Build the article payload dynamically
  const articleData = {
    title,
    body_markdown: body,
    published: true
  };
  if (tags && tags.length > 0) {
    articleData.tags = tags;
    console.error(`🏷️ Tags: ${tags.join(', ')}`);
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
      updated_at: data.edited_at || data.published_at,
      method,
    };
    console.error(`✅ Success! Post ${isUpdating ? 'updated' : 'published'}: ${postDetails.url}`);
    console.log(JSON.stringify(postDetails));
    return postDetails;
  } else {
    const errorDetails = {
      error: true,
      message: data.error || response.statusText || 'Unknown error',
      status: response.status,
      response_data: data,
      ...existingEnv,
    };
    console.error('❌ Error posting/updating:', errorDetails.message);
    console.error('📋 Full error details:', JSON.stringify(errorDetails, null, 2));
    console.log(JSON.stringify(errorDetails));
    process.exit(1);
  }
}

async function main() {
  try {
    console.error('🔍 Environment check:');
    console.error(`- DEV_TO_API_KEY: ${process.env.DEV_TO_API_KEY ? 'Set' : 'Not set'}`);
    console.error(`- GITHUB_USERNAME: ${process.env.GITHUB_USERNAME || 'Not set'}`);
    console.error(`- GITHUB_REPO: ${process.env.GITHUB_REPO || 'Not set'}`);
    console.error(`- GITHUB_BRANCH: ${process.env.GITHUB_BRANCH || 'Not set'}`);

    const envVars = {
      id: process.env.DEV_TO_SAVED_POST_ID,
      title: process.env.DEV_TO_SAVED_POST_TITLE,
      url: process.env.DEV_TO_SAVED_POST_URL,
      published_at: process.env.DEV_TO_SAVED_POST_PUBLISHED_AT,
      updated_at: process.env.DEV_TO_SAVED_POST_UPDATED_AT,
    };
    
    const existingEnv = envVars.id ? envVars : null;
    
    if (existingEnv) {
      console.error('💾 Found saved post data:', existingEnv);
    } else {
      console.error('ℹ️ No saved post data found, will create new post');
    }
    
    await postOrUpdateArticle({ existingEnv });
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

main();
