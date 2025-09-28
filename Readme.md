# Multi-Platform Blog Publisher

[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Hashnode](https://img.shields.io/badge/Platform-Hashnode-2962FF?style=for-the-badge&logo=hashnode&logoColor=white)](https://hashnode.com)
[![Dev.to](https://img.shields.io/badge/Platform-Dev.to-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white)](https://dev.to)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

---

> 🚀 **Automatically publish your articles to multiple blogging platforms using GitHub Actions**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Content Format](#content-format)
- [Setup Instructions](#setup-instructions)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

This project automates the process of synchronizing content between GitHub README files and various blogging platforms. Eliminate manual copy-pasting and separate content maintenance—write once in Markdown and publish everywhere!

**GitHub README → Blog Post Automation**

### Supported Platforms

- ✅ **[Hashnode](https://hashnode.com)** - Fully integrated
- ✅ **[Dev.to](https://dev.to)** - Fully integrated  
- 🚧 **Medium** - API restrictions prevent automation
- 🚧 **LinkedIn** - OAuth limitations prevent API usage

---

## Features

- **⚡ Zero Setup**: No need to create API scripts—everything is included
- **🌐 Multi-Platform**: Supports Hashnode and Dev.to
- **🧠 Smart Updates**: Automatically tracks and updates existing posts
- **🖼️ Image Processing**: Converts relative image paths to GitHub raw URLs
- **📝 Flexible Content**: Works with any markdown content structure
- **🔒 Secure**: All credentials stay in your repository secrets
- **♻️ State Management**: Saves post metadata for future updates

---

## Quick Start

### 1. Fork or Use This Repository
![gokulnathan66 article-automation Repo](https://github.com/gokulnathan66/article-automation)

You can either fork this repository or use it as a GitHub Action in your own repository.

### 2. Set Up Your Content Repository

Create a repository structure like this:

```
your-blog-repo/
├── content/                 # Your articles directory
│   └── README.md           # Your article content
├── .github/workflows/
│   └── publish.yml         # Workflow using these actions
├── images/                 # Optional: images referenced in articles
│   └── screenshot.png
└── README.md              # Project documentation
```

### 3. Configure GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add the required secrets.

### 4. Create Workflow File

Create `.github/workflows/publish.yml` with the provided configuration.

### 5. Push and Publish! 🎉

Your articles will be automatically published when you push to the main branch.

---

## Repository Structure

```
article-automation/
├── hashnode-publish/
│   ├── action.yml          # Hashnode action definition
│   └── scripts/
│       └── hashnode.js     # Hashnode publishing script
├── devto-publish/
│   ├── action.yml          # Dev.to action definition
│   └── scripts/
│       └── devto_post.js   # Dev.to publishing script
├── api/                    # Legacy API scripts
│   ├── hashnode.js
│   └── devto_post.js
├── package.json            # Dependencies for scripts
├── image.png              # Project logo
└── README.md              # This file
```

---

## Installation

### Method 1: Use as GitHub Action (Recommended)

Add this to your workflow file:

```yaml
- name: Publish to Hashnode
  uses: gokulnathan66/article-automation/hashnode-publish@main
  with:
    hashnode-pat: ${{ secrets.HASHNODE_PAT }}
    # ... other configuration
```

### Method 2: Fork and Customize

1. Fork this repository
2. Customize the scripts in `hashnode-publish/scripts/` or `devto-publish/scripts/`
3. Update action configurations in `action.yml` files
4. Use your forked version in workflows

---

## Usage

### GitHub Secrets Configuration

#### For Hashnode:
- `HASHNODE_PAT` - Your Hashnode Personal Access Token
- `HASHNODE_PUBLICATION_ID` - Your publication ID
- `HASHNODE_PUBLICATION_HOST` - Your publication domain (e.g., `yourblog.hashnode.dev`)
- `VAR_EDIT_TOKEN_GIT` - GitHub token with `repo` and `actions:write` permissions

#### For Dev.to:
- `DEV_TO_API_KEY` - Your Dev.to API Key
- `VAR_EDIT_TOKEN_GIT` - GitHub token with `repo` and `actions:write` permissions

### Workflow Configuration

Create `.github/workflows/publish.yml`:

```yaml
name: Multi-Platform Publishing

on:
  push:
    branches: [main]
    paths: 
      - 'content/**'
      - 'README.md'
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  publish-hashnode:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    
    steps:
      - name: Checkout content
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
        
      - name: Validate required secrets
        run: |
          if [ -z "${{ secrets.HASHNODE_PAT }}" ]; then
            echo "Error: HASHNODE_PAT secret is not set"
            exit 1
          fi
          
      - name: Publish to Hashnode
        uses: gokulnathan66/article-automation/hashnode-publish@main
        with:
          hashnode-pat: ${{ secrets.HASHNODE_PAT }}
          hashnode-publication-id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
          hashnode-publication-host: ${{ secrets.HASHNODE_PUBLICATION_HOST }}
          github-token: ${{ secrets.VAR_EDIT_TOKEN_GIT }}
          saved-post-id: ${{ vars.HASHNODE_SAVED_POST_ID }}
          saved-post-slug: ${{ vars.HASHNODE_SAVED_POST_SLUG }}
          saved-post-title: ${{ vars.HASHNODE_SAVED_POST_TITLE }}
          saved-post-url: ${{ vars.HASHNODE_SAVED_POST_URL }}
          saved-post-published-at: ${{ vars.HASHNODE_SAVED_POST_PUBLISHED_AT }}
          saved-post-updated-at: ${{ vars.HASHNODE_SAVED_POST_UPDATED_AT }}

  publish-devto:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    
    steps:
      - name: Checkout content
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
        
      - name: Validate required secrets
        run: |
          if [ -z "${{ secrets.DEV_TO_API_KEY }}" ]; then
            echo "Error: DEV_TO_API_KEY secret is not set"
            exit 1
          fi
        
      - name: Publish to Dev.to
        uses: gokulnathan66/article-automation/devto-publish@main
        with:
          devto-api-key: ${{ secrets.DEV_TO_API_KEY }}
          github-token: ${{ secrets.VAR_EDIT_TOKEN_GIT }}
          saved-post-id: ${{ vars.DEV_TO_SAVED_POST_ID }}
          saved-post-title: ${{ vars.DEV_TO_SAVED_POST_TITLE }}
          saved-post-url: ${{ vars.DEV_TO_SAVED_POST_URL }}
          saved-post-published-at: ${{ vars.DEV_TO_SAVED_POST_PUBLISHED_AT }}
          saved-post-updated-at: ${{ vars.DEV_TO_SAVED_POST_UPDATED_AT }}
```

---

## Configuration

### Hashnode Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `hashnode-pat` | ✅ | - | Hashnode Personal Access Token |
| `hashnode-publication-id` | ✅ | - | Publication ID |
| `hashnode-publication-host` | ✅ | - | Publication host |
| `github-token` | ✅ | - | GitHub token |
| `content-path` | ❌ | `'content'` | Path to content files |
| `node-version` | ❌ | `'20'` | Node.js version |
| `saved-post-*` | ❌ | - | Previously saved post data for updates |

### Dev.to Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `devto-api-key` | ✅ | - | Dev.to API Key |
| `github-token` | ✅ | - | GitHub token |
| `content-path` | ❌ | `'content'` | Path to content files |
| `node-version` | ❌ | `'24'` | Node.js version |
| `saved-post-*` | ❌ | - | Previously saved post data for updates |

---

## Content Format

Your markdown files should follow this structure:

```markdown
# Your Article Title

Your content here with markdown formatting.

## Sections

You can include images, code blocks, and other markdown elements.

![Screenshot](images/screenshot.png)

### Code Examples

```javascript
// Example: Basic error handling in Node.js
try {
  const result = processData();
  console.log("Processing successful:", result);
} catch (error) {
  console.error("Error occurred:", error.message);
  process.exit(1);
}

function processData() {
  // Your processing logic here
  return "Hello, World!";
}
```

<!-- Add tags at the end (optional) -->
Tags: javascript, tutorial, webdev, githubactions 
Tag "github-actions" contains non-alphanumeric or prohibited unicode characters
```

> **Important**: Tags should be added at the end of your content using the format `Tags: tag1, tag2, tag3`. Avoid non-alphanumeric characters in tags.

---

## Setup Instructions

### Getting Hashnode Credentials

#### 1. Personal Access Token
1. Go to [Hashnode](https://hashnode.com) → **Settings** → **Developer**
2. Generate **Personal Access Token**
3. Add as `HASHNODE_PAT` secret in your repository

#### 2. Publication Details
1. Go to your publication dashboard
2. Copy **Publication ID** from the URL or settings
3. Use your publication domain (e.g., `yourblog.hashnode.dev`)

### Getting Dev.to API Key

1. Go to [Dev.to](https://dev.to) → **Settings** → **Extensions**
2. Scroll to **"DEV Community API Keys"**
3. Generate a new API key
4. Add as `DEV_TO_API_KEY` secret in your repository

### Setting up GitHub Token

1. Go to **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Configure the token:
   - **Note**: `Article Automation Token`
   - **Expiration**: Choose appropriate duration (30-90 days recommended)
   - **Scopes**: Select the following:
     - ✅ `repo` (full repository access)
     - ✅ `workflow` (update GitHub Action workflows)
     - ✅ `write:packages` (if using packages)
4. Click **"Generate token"** and copy the token immediately
5. Add as `VAR_EDIT_TOKEN_GIT` secret in your repository

> **Security Note**: 
> - Set an expiration date for your GitHub token for better security
> - GitHub will notify you before the token expires
> - Store the token securely—you won't be able to see it again
> - Regenerate tokens periodically as a security best practice

### Local Development Setup

For testing locally, create a `.env` file in your project root:

```env
# Required for Hashnode
HASHNODE_PAT=your_hashnode_personal_access_token
HASHNODE_PUBLICATION_ID=your_publication_id
HASHNODE_PUBLICATION_HOST=yourblog.hashnode.dev

# Required for Dev.to
DEV_TO_API_KEY=your_devto_api_key

# Required for GitHub operations
VAR_EDIT_TOKEN_GIT=your_github_token

# Optional: Content path (defaults to 'content')
CONTENT_PATH=content
```

> **⚠️ Important**: Never commit your `.env` file to version control. Add it to your `.gitignore` file.

---

## Usage Examples

### Single Platform Deployment

**Hashnode only:**
```yaml
uses: gokulnathan66/article-automation/hashnode-publish@main
```

**Dev.to only:**
```yaml
uses: gokulnathan66/article-automation/devto-publish@main
```

### Custom Content Path

```yaml
uses: gokulnathan66/article-automation/hashnode-publish@main
with:
  # ... other inputs
  content-path: 'articles'  # Look in 'articles' directory instead
```

### Different Node.js Version

```yaml
uses: gokulnathan66/article-automation/devto-publish@main
with:
  # ... other inputs
  node-version: '18'  # Use Node.js 18 instead of default 24
```

---

## How It Works

1. **Content Detection**: Finds `README.md` in your content directory or repository root
2. **Title Extraction**: Uses the first `# heading` as the article title
3. **Image Processing**: Converts relative image paths to GitHub raw URLs
4. **Tag Processing**: Extracts tags from `Tags:` line at the end of content
5. **Smart Publishing**: 
   - Checks for existing posts with the same title
   - Creates new post if none exists
   - Updates existing post if found
6. **State Management**: Saves post IDs and metadata to repository variables for future updates

---

## Troubleshooting

### Common Issues

| Issue | Solution | Additional Steps |
|-------|----------|------------------|
| **Action not found** | Ensure repository is public or you have proper access | Check the action reference path is correct |
| **README not found** | Check content directory path and verify file exists | Verify `content-path` input matches your structure |
| **API errors** | Verify all secrets are correctly configured | Test API keys manually with curl commands |
| **Permission errors** | Ensure GitHub token has required scopes | Regenerate token with proper permissions |
| **Image not loading** | Check image paths and ensure they're accessible | Use absolute URLs or verify relative paths |
| **Tags not working** | Check tag format and characters | Use only alphanumeric characters and hyphens |
| **Content not updating** | Clear browser cache and check post URLs | Verify the post ID variables are updated |

### Debugging Steps

1. **Check Action Logs**: Go to the **Actions** tab in your repository for detailed execution logs
2. **Verify Secrets**: Ensure all required secrets are set in repository settings
3. **Test API Keys**: 
   ```bash
   # Test Hashnode API
   curl -H "Authorization: Bearer YOUR_TOKEN" https://gql.hashnode.com
   
   # Test Dev.to API  
   curl -H "api-key: YOUR_API_KEY" https://dev.to/api/articles/me
   ```
4. **Check File Paths**: Verify your content structure matches the expected format
5. **Review Variables**: Check repository variables for saved post metadata

### Error Messages and Solutions

#### "Post not found" or "Failed to update"
- **Cause**: Post metadata variables are incorrect or outdated
- **Solution**: Delete the post variables from repository settings and republish

#### "Invalid API key" or "Unauthorized"
- **Cause**: API keys are expired or incorrect
- **Solution**: Regenerate API keys and update repository secrets

#### "File not found" errors
- **Cause**: Content path configuration doesn't match your repository structure
- **Solution**: Update the `content-path` input in your workflow

#### "Image upload failed"
- **Cause**: Images are not accessible or paths are incorrect
- **Solution**: Use GitHub raw URLs or verify image accessibility

### Important Warnings

> **⚠️ Content Overwriting**: When you update something in your blog manually, it will be overwritten by this action. You must update the README, and that will automatically update the blog.

> **ℹ️ Local Testing**: If you want to test locally, create a `.env` file with the required variables.

### Frequently Asked Questions

#### Q: Can I publish to multiple platforms simultaneously?
A: Yes, the workflow supports parallel publishing to both Hashnode and Dev.to. Each platform runs in a separate job.

#### Q: How do I handle images in my articles?
A: Use relative paths in your markdown (e.g., `![Alt text](images/photo.jpg)`). The action automatically converts them to GitHub raw URLs.

#### Q: Can I schedule automatic publishing?
A: Yes, add a `schedule` trigger to your workflow:
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

#### Q: What happens if my API key expires?
A: The action will fail with an authentication error. Update your repository secrets with a new API key.

#### Q: Can I customize the publication process?
A: Yes, fork the repository and modify the scripts in the `hashnode-publish/scripts/` or `devto-publish/scripts/` directories.

#### Q: How do I prevent certain files from triggering publication?
A: Use the `paths` filter in your workflow to specify which files should trigger the action.

---

## Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/article-automation.git
   cd article-automation
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
5. **Make your changes**
6. **Test your changes** (add tests if applicable)
7. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
8. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
9. **Open a Pull Request**

### Contribution Guidelines

#### Code Standards
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comprehensive comments for complex logic
- Ensure compatibility with Node.js 18+ and 20+

#### Pull Request Process
1. **Create Feature Branch**: Use descriptive names (e.g., `feature/add-medium-support`)
2. **Write Tests**: Add unit tests for new functionality
3. **Update Documentation**: Keep README and inline docs current
4. **Test Thoroughly**: Ensure all tests pass and no regressions
5. **Write Clear Commits**: Use conventional commit format
   ```
   feat: add support for Medium platform
   fix: resolve image upload timeout issue
   docs: update API configuration examples
   ```

#### Testing Your Changes
```bash
# Install dependencies
npm install

# Run tests (if available)
npm test

# Test locally with sample content
node scripts/test-local.js
```

#### Areas for Contribution
- 🆕 New platform integrations (Medium, LinkedIn, etc.)
- 🔧 Improved error handling and retry logic
- 📚 Better documentation and examples
- 🧪 Comprehensive test coverage
- 🎨 UI improvements for logs and outputs
- 🔍 Advanced content processing features

### Reporting Issues

When reporting issues, please include:

#### Required Information
- **Environment**: OS, Node.js version, Action version
- **Configuration**: Sanitized workflow file (remove secrets)
- **Error Details**: Complete error messages and stack traces
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected vs Actual**: What should happen vs what does happen

#### Issue Templates
Use the appropriate issue template:
- 🐛 **Bug Report**: For unexpected behavior or errors
- 💡 **Feature Request**: For new functionality suggestions  
- 📚 **Documentation**: For documentation improvements
- ❓ **Question**: For usage questions and support

#### Example Issue Report
```markdown
**Bug Description**: Action fails when publishing large images

**Environment**:
- OS: Ubuntu 22.04
- Node.js: 20.x
- Action Version: @main

**Steps to Reproduce**:
1. Add image larger than 5MB to content
2. Push to main branch
3. Action fails with timeout error

**Expected**: Image should be processed and uploaded
**Actual**: Action times out after 5 minutes

**Logs**: [Attach relevant action logs]
```

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## Acknowledgments

- Built with [GitHub Actions](https://github.com/features/actions)
- Integrates with [Hashnode](https://hashnode.com) and [Dev.to](https://dev.to)
- Inspired by the need for automated content distribution
- Thanks to all [contributors](https://github.com/gokulnathan66/article-automation/contributors)

---

<div align="center">

**Made with ❤️ by [Gokul Nathan B](https://github.com/gokulnathan66)**

[Report Bug](https://github.com/gokulnathan66/article-automation/issues) • [Request Feature](https://github.com/gokulnathan66/article-automation/issues) • [Documentation](https://github.com/gokulnathan66/article-automation)

</div>
