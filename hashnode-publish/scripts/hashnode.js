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

/**
 * Makes GraphQL requests to Hashnode API
 */
async function makeHashnodeRequest(query, variables = {}) {
  const response = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.HASHNODE_PAT,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
  }
  
  return result.data;
}

/**
 * Gets all posts from the publication to find existing post by title
 */
async function findExistingPostByTitle(title) {
  const query = `
    query GetPosts($host: String!, $first: Int!) {
      publication(host: $host) {
        posts(first: $first) {
          edges {
            node {
              id
              slug
              title
              url
              publishedAt
              updatedAt
            }
          }
        }
      }
    }
  `;

  const variables = {
    host: process.env.HASHNODE_PUBLICATION_HOST,
    first: 50, // Adjust based on how many posts you might have
  };

  try {
    console.error(`Searching for existing post with title: "${title}"`);
    const data = await makeHashnodeRequest(query, variables);
    
    if (!data.publication) {
      console.error(`Publication not found for host: ${process.env.HASHNODE_PUBLICATION_HOST}`);
      return null;
    }

    const posts = data.publication.posts.edges.map(edge => edge.node);
    const existingPost = posts.find(post => post.title.trim() === title.trim());
    
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
 * Gets post details by slug
 */
async function getPostBySlug(slug) {
  const query = `
    query GetPost($slug: String!, $host: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          id
          slug
          title
          url
          publishedAt
          updatedAt
        }
      }
    }
  `;

  const variables = {
    slug,
    host: process.env.HASHNODE_PUBLICATION_HOST,
  };

  try {
    console.error(`Searching for existing post with slug: "${slug}"`);
    const data = await makeHashnodeRequest(query, variables);
    
    const post = data.publication?.post;
    if (post) {
      console.error(`Found existing post by slug: ${post.id} - "${post.title}"`);
    } else {
      console.error('No existing post found with matching slug');
    }
    
    return post;
  } catch (error) {
    console.error('Error searching by slug:', error.message);
    return null;
  }
}

/**
 * Publishes a new article to Hashnode
 */
async function publishNewArticle(title, content, tags) {
  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          slug
          title
          url
          publishedAt
          updatedAt
        }
      }
    }
  `;

  // Convert string tags to proper tag objects
  const formattedTags = tags ? tags.map(tag => ({
    slug: tag.toLowerCase().replace(/\s+/g, ''),
    name: tag
  })) : [];

  const variables = {
    input: {
      publicationId: process.env.HASHNODE_PUBLICATION_ID,
      title,
      contentMarkdown: content,
      tags: formattedTags,
    },
  };

  const data = await makeHashnodeRequest(mutation, variables);
  return data.publishPost.post;
}

/**
 * Updates an existing article on Hashnode
 */
async function updateExistingArticle(postId, title, content, tags) {
  const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          slug
          title
          url
          publishedAt
          updatedAt
        }
      }
    }
  `;

  // Convert string tags to proper tag objects
  const formattedTags = tags ? tags.map(tag => ({
    slug: tag.toLowerCase().replace(/\s+/g, ''),
    name: tag
  })) : [];

  const variables = {
    input: {
      id: postId,
      title,
      contentMarkdown: content,
      tags: formattedTags,
    },
  };

  const data = await makeHashnodeRequest(mutation, variables);
  return data.updatePost.post;
}

/**
 * Creates a slug from title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

/**
 * Validates if an ID looks like a Hashnode post ID
 */
function isValidHashnodeId(id) {
  // Hashnode IDs are typically 24-character MongoDB ObjectIds
  return id && id.length >= 20 && /^[a-zA-Z0-9]+$/.test(id);
}

export async function postOrUpdateArticle({ existingEnv }) {
  const { title, body, tags } = await getReadmeData();
  const slug = createSlug(title);

  let isUpdating = false;
  let existingPost = null;

  console.error(`Processing article: "${title}"`);
  console.error(`Generated slug: "${slug}"`);

  // Strategy 1: Check if we have a VALID Hashnode post ID from environment
  if (existingEnv?.id && isValidHashnodeId(existingEnv.id)) {
    console.error(`Using saved Hashnode post ID: ${existingEnv.id}`);
    isUpdating = true;
    existingPost = { id: existingEnv.id };
  } else if (existingEnv?.id) {
    console.error(`Saved ID (${existingEnv.id}) appears to be from another platform, ignoring...`);
  }

  // Strategy 2: Try to find existing post by title (more reliable)
  if (!existingPost) {
    existingPost = await findExistingPostByTitle(title);
    if (existingPost) {
      isUpdating = true;
    }
  }

  // Strategy 3: If title search fails, try slug search
  if (!existingPost) {
    existingPost = await getPostBySlug(slug);
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
      slug: postResult.slug,
      title: postResult.title,
      url: postResult.url,
      published_at: postResult.publishedAt,
      updated_at: postResult.updatedAt,
      method: isUpdating ? 'UPDATE' : 'POST',
    };

    // ONLY output the JSON to stdout - this is what gets parsed by GitHub Actions
    console.log(JSON.stringify(postDetails));
    return postDetails;

  } catch (error) {
    const errorDetails = {
      error: true,
      message: error.message || 'Unknown error',
      ...existingEnv,
    };
    console.error('Error posting/updating:', errorDetails.message);
    // Output error as JSON to stdout for GitHub Actions to parse
    console.log(JSON.stringify(errorDetails));
    process.exit(1);
  }
}

async function main() {
  // Validate required environment variables
  const requiredVars = [
    'HASHNODE_PAT',
    'HASHNODE_PUBLICATION_ID',
    'HASHNODE_PUBLICATION_HOST'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`${varName} environment variable is required`);
    }
  }

  console.error('Environment check:');
  console.error(`- HASHNODE_PUBLICATION_HOST: ${process.env.HASHNODE_PUBLICATION_HOST}`);
  console.error(`- HASHNODE_PUBLICATION_ID: ${process.env.HASHNODE_PUBLICATION_ID}`);
  console.error(`- HASHNODE_PAT: ${process.env.HASHNODE_PAT ? 'Set' : 'Not set'}`);

  const envVars = {
    id: process.env.HASHNODE_SAVED_POST_ID,
    slug: process.env.HASHNODE_SAVED_POST_SLUG,
    title: process.env.HASHNODE_SAVED_POST_TITLE,
    url: process.env.HASHNODE_SAVED_POST_URL,
    published_at: process.env.HASHNODE_SAVED_POST_PUBLISHED_AT,
    updated_at: process.env.HASHNODE_SAVED_POST_UPDATED_AT,
  };
  
  const existingEnv = envVars.id ? envVars : null;
  
  if (existingEnv) {
    console.error('Found saved post data:', existingEnv);
  } else {
    console.error('No saved post data found, will check for existing posts by title/slug');
  }
  
  await postOrUpdateArticle({ existingEnv });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
