# Multi-Platform Blog Publisher

[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Hashnode](https://img.shields.io/badge/Platform-Hashnode-2962FF?style=for-the-badge&logo=hashnode&logoColor=white)](https://hashnode.com)
[![Dev.to](https://img.shields.io/badge/Platform-Dev.to-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white)](https://dev.to)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

> :rocket: **Automatically publish your articles to multiple blogging platforms using GitHub Actions**

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

This project automates the process of synchronizing content between GitHub README files and various blogging platforms. No more manual copy-pasting or maintaining separate content—write once in markdown and publish everywhere!

**GitHub README → Blog Post Automation**

### Supported Platforms

- :white_check_mark: **[Hashnode](https://hashnode.com)** - Fully integrated
- :white_check_mark: **[Dev.to](https://dev.to)** - Fully integrated  
- :construction: **Medium** - API restrictions prevent automation
- :construction: **LinkedIn** - OAuth limitations prevent API usage

---

## Features

- **:zap: Zero Setup**: No need to create API scripts—everything is included
- **:globe_with_meridians: Multi-Platform**: Supports Hashnode and Dev.to
- **:brain: Smart Updates**: Automatically tracks and updates existing posts
- **:framed_picture: Image Processing**: Converts relative image paths to GitHub raw URLs
- **:memo: Flexible Content**: Works with any markdown content structure
- **:lock: Secure**: All credentials stay in your repository secrets
- **:recycle: State Management**: Saves post metadata for future updates

---

## Quick Start

### 1. Fork or Use This Repository

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

### 5. Push and Publish! :tada:

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
  workflow_dispatch:

jobs:
  publish-hashnode:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout content
        uses: actions/checkout@v4
        
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
    steps:
      - name: Checkout content
        uses: actions/checkout@v4
        
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
| `hashnode-pat` | :white_check_mark: | - | Hashnode Personal Access Token |
| `hashnode-publication-id` | :white_check_mark: | - | Publication ID |
| `hashnode-publication-host` | :white_check_mark: | - | Publication host |
| `github-token` | :white_check_mark: | - | GitHub token |
| `content-path` | :x: | `'content'` | Path to content files |
| `node-version` | :x: | `'20'` | Node.js version |
| `saved-post-*` | :x: | - | Previously saved post data for updates |

### Dev.to Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `devto-api-key` | :white_check_mark: | - | Dev.to API Key |
| `github-token` | :white_check_mark: | - | GitHub token |
| `content-path` | :x: | `'content'` | Path to content files |
| `node-version` | :x: | `'24'` | Node.js version |
| `saved-post-*` | :x: | - | Previously saved post data for updates |

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
console.log("Hello, World!");
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

1. Go to **GitHub** → **Settings** → **Developer settings** → **Personal access tokens**
2. Generate token with these scopes:
   - `repo` (full repository access)
   - `actions:write` (to update repository variables)
3. Add as `VAR_EDIT_TOKEN_GIT` secret in your repository

> **Security Note**: Set an expiration date for your GitHub token. GitHub will notify you before it expires so you can renew it.

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

| Issue | Solution |
|-------|----------|
| **Action not found** | Ensure repository is public or you have proper access |
| **README not found** | Check content directory path and verify file exists |
| **API errors** | Verify all secrets are correctly configured |
| **Permission errors** | Ensure GitHub token has required scopes |
| **Image not loading** | Check image paths and ensure they're accessible |

### Debug Information

The actions provide comprehensive logging. Check the **Actions** tab in your repository for detailed execution logs.

### Important Warnings

> **:warning: Content Overwriting**: When you update something in your blog manually, it will be overwritten by this action. You must update the README, and that will automatically update the blog.

> **:information_source: Local Testing**: If you want to test locally, create a `.env` file with the required variables.

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

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass
- Write clear, descriptive commit messages

### Reporting Issues

- Use the [issue tracker](https://github.com/gokulnathan66/article-automation/issues)
- Provide detailed description of the problem
- Include steps to reproduce
- Add relevant logs or screenshots

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- :white_check_mark: Commercial use
- :white_check_mark: Modification
- :white_check_mark: Distribution
- :white_check_mark: Private use
- :x: Liability
- :x: Warranty

---

## Acknowledgments

- Built with [GitHub Actions](https://github.com/features/actions)
- Integrates with [Hashnode](https://hashnode.com) and [Dev.to](https://dev.to)
- Inspired by the need for automated content distribution
- Thanks to all [contributors](https://github.com/gokulnathan66/article-automation/contributors)

---

<div align="center">

**Made with :heart: by [Gokul Nathan B](https://github.com/gokulnathan66)**

[Report Bug](https://github.com/gokulnathan66/article-automation/issues) • [Request Feature](https://github.com/gokulnathan66/article-automation/issues) • [Documentation](https://github.com/gokulnathan66/article-automation)

</div>