# Article Automation for success test post  Hashcode Test update 

![Article Automation](image.png)

This project automates the process of synchronizing content between GitHub README files and various blogging platforms. test hashcode 

## Overview

GitHub README ↔ Blog Post Automation

## Supported Platforms

### 1. Google Blogger
First platform integration

### 2. Dev.to Blog
Second platform integration  

### 3. Hashnode
Next platform to be integrated

## Setup Instructions

### Dev.to Configuration

1. **Account Setup**
   - Go to your Dev.to account or create a new one
   - Navigate to the settings page

2. **API Key Generation**
   - Go to the Extensions tab
   - Create an API key with your desired name
   - Save the API key in `.env` file or a secure location for later use

3. **Post Management**
   - This tool supports updating existing posts
   - Save post IDs in environment variables or secrets for reference

## Configuration

- Store API keys securely in environment variables
- Save post IDs in secrets for automated updates

# Setup Instructions

1. Generate a Personal Access Token (PAT) with the following scopes:
  - repo (for private repos)
  - workflow or actions:write (to update repo variables)
2. Add the PAT as a secret named `VAR_EDIT_TOKEN_GIT` (or change the workflow accordingly). (minimal permission to only edit this repo env vairalbe you can configure youself the low level permission to work with . set a expiration date, github will notify you when this token will expire you can renew that no need to set no expoeriation- not the best practice )

3. Trigger the workflow on your repo.

the tags need to be extracted from the readme with certain tags at the end of the read me if not found the age field should be ignored in the post or put command 

TAGS: javascript, automation, githubactions 
    no non numerical vlaue no ` - in the tags `


Next is linkedin article automation. linkedin outh is not supported for APIs
Medium completely restrice the use of APIs and even when trying to post usuing the plawrigh automation it enable only the email login to completely cutoff the autoamtion so next implementaition is hashcode 


# Hashcode automation 
add the following in the gihtub secrets to make hashcode works 
- hashcode publication id is present in your dashboard URL
# add the github url and the published article url manually in the repo readme for working reflecting in the blog. 

# Hashnode uses:
HASHNODE_PAT: ${{ secrets.HASHNODE_PAT }}
HASHNODE_PUBLICATION_ID: ${{ secrets.HASHNODE_PUBLICATION_ID }}
HASHNODE_PUBLICATION_HOST: ${{ secrets.HASHNODE_PUBLICATION_HOST }}

optionl : if you want to test locally make the variable in the .env to make works 
- You can use this workflow in your github repo 

# Be carefull 
- as of now when you update someting in you blog it will be overwritten by this action (you have to update the readme and that will automatically updates the blog ) {future robust integration is need to do in this }
- some post id are still showing int he execution of my worklow 


# Multi-Platform Blog Publisher

🚀 Automatically publish your articles to multiple blogging platforms using GitHub Actions.

## ✨ Features

- **Zero Setup**: No need to create API scripts - everything is included
- **Multi-Platform**: Supports Hashnode and Dev.to
- **Smart Updates**: Tracks and updates existing posts automatically
- **Flexible Content**: Works with any markdown content structure
- **Image Processing**: Automatically converts relative image paths to GitHub raw URLs

## 🏗️ Repository Structure

article-automation/
├── hashnode-publish/
│ ├── action.yml # Hashnode action definition
│ └── scripts/
│ └── hashnode.js # Hashnode publishing script
├── devto-publish/
│ ├── action.yml # Dev.to action definition
│ └── scripts/
│ └── devto_post.js # Dev.to publishing script
├── package.json # Dependencies
└── README.md # This file
text

## 🚀 Quick Start for Users

### Step 1: Set up your content repository

your-blog-repo/
├── content/ # Your articles (customizable path)
│ ├── article1.md
│ └── article2.md
├── .github/workflows/
│ └── publish.yml
└── README.md
text

### Step 2: Add GitHub Secrets

**For Hashnode:**
- `HASHNODE_PAT`
- `HASHNODE_PUBLICATION_ID` 
- `HASHNODE_PUBLICATION_HOST`
- `VAR_EDIT_TOKEN_GIT`

**For Dev.to:**
- `DEV_TO_API_KEY`
- `VAR_EDIT_TOKEN_GIT`

### Step 3: Create workflow

name: Publish Articles
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
text
  - name: Publish to Hashnode
    uses: gokulnathb/article-automation/hashnode-publish@main
    with:
      hashnode-pat: ${{ secrets.HASHNODE_PAT }}
      hashnode-publication-id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
      hashnode-publication-host: ${{ secrets.HASHNODE_PUBLICATION_HOST }}
      github-token: ${{ secrets.VAR_EDIT_TOKEN_GIT }}
publish-devto:
runs-on: ubuntu-latest
steps:
- name: Checkout content
uses: actions/checkout@v4
text
  - name: Publish to Dev.to
    uses: gokulnathb/article-automation/devto-publish@main
    with:
      devto-api-key: ${{ secrets.DEV_TO_API_KEY }}
      github-token: ${{ secrets.VAR_EDIT_TOKEN_GIT }}
text

## 📝 Content Format

Your markdown files should include:

Your Article Title
Your content here...
<!-- Optional: Add tags at the end -->
Tags: javascript, tutorial, webdev
text

## 🔧 Customization Options

Both actions accept these inputs:
- `content-path`: Path to your markdown files (default: 'content')
- `node-version`: Node.js version to use

## 📖 Setup Instructions

### Getting Hashnode Credentials:
1. Go to Hashnode → Settings → Developer
2. Generate Personal Access Token
3. Get Publication ID and Host from publication settings

### Getting Dev.to API Key:
1. Go to Dev.to → Settings → Extensions  
2. Generate API Key under "DEV Community API Keys"

### Setting up GitHub Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate token with `repo` and `actions:write` scopes
3. Add as `VAR_EDIT_TOKEN_GIT` secret

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License


# Multi-Platform Blog Publisher

🚀 **Automatically publish your articles to multiple blogging platforms using GitHub Actions**

[![GitHub](https://img.shields.io/badge/GitHub-Actions-blue)](https://github.com/features/actions)
[![Hashnode](https://img.shields.io/badge/Platform-Hashnode-2962ff)](https://hashnode.com)
[![Dev.to](https://img.shields.io/badge/Platform-Dev.to-0a0a0a)](https://dev.to)

## ✨ Features

- **🔄 Zero Setup**: No need to create API scripts - everything is included
- **🌐 Multi-Platform**: Supports Hashnode and Dev.to
- **🧠 Smart Updates**: Automatically tracks and updates existing posts
- **🖼️ Image Processing**: Converts relative image paths to GitHub raw URLs
- **📝 Flexible Content**: Works with any markdown content structure
- **🔒 Secure**: All credentials stay in your repository secrets

## 🏗️ Repository Structure

article-automation/
├── hashnode-publish/
│ ├── action.yml # Hashnode action definition
│ └── scripts/
│ └── hashnode.js # Hashnode publishing script
├── devto-publish/
│ ├── action.yml # Dev.to action definition
│ └── scripts/
│ └── devto_post.js # Dev.to publishing script
├── package.json # Dependencies for scripts
└── README.md # This file
text

## 🚀 Quick Start for Users

### Step 1: Set up your content repository

Create a repository with your markdown content:

your-blog-repo/
├── content/ # Your articles directory
│ └── README.md # Your article content
├── .github/workflows/
│ └── publish.yml # Workflow using these actions
└── images/ # Optional: images referenced in articles
└── screenshot.png
text

### Step 2: Configure GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### For Hashnode:
- `HASHNODE_PAT` - Your Hashnode Personal Access Token
- `HASHNODE_PUBLICATION_ID` - Your publication ID
- `HASHNODE_PUBLICATION_HOST` - Your publication domain (e.g., `yourblog.hashnode.dev`)
- `VAR_EDIT_TOKEN_GIT` - GitHub token with `repo` and `actions:write` permissions

#### For Dev.to:
- `DEV_TO_API_KEY` - Your Dev.to API Key
- `VAR_EDIT_TOKEN_GIT` - GitHub token with `repo` and `actions:write` permissions

### Step 3: Create workflow

Create `.github/workflows/publish.yml`:

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
text
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
text
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
text

## 📝 Content Format

Your markdown files should follow this format:

Your Article Title
Your content here with markdown formatting.
Sections
You can include images, code blocks, and other markdown elements.
![Screenshot](images/screenshot. at the end (optional) -->
Tags: javascript, tutorial, webdev, github-actions
text

## ⚙️ Configuration Options

### Hashnode Action Inputs:
- `hashnode-pat` (required): Hashnode Personal Access Token
- `hashnode-publication-id` (required): Publication ID
- `hashnode-publication-host` (required): Publication host
- `github-token` (required): GitHub token
- `content-path` (optional): Path to content files (default: 'content')
- `node-version` (optional): Node.js version (default: '20')
- `saved-post-*` (optional): Previously saved post data for updates

### Dev.to Action Inputs:
- `devto-api-key` (required): Dev.to API Key
- `github-token` (required): GitHub token
- `content-path` (optional): Path to content files (default: 'content')
- `node-version` (optional): Node.js version (default: '24')
- `saved-post-*` (optional): Previously saved post data for updates

## 🔧 How It Works

1. **Content Detection**: Finds README.md in your content directory or repository root
2. **Title Extraction**: Uses the first `# heading` as the article title
3. **Image Processing**: Converts relative image paths to GitHub raw URLs
4. **Tag Processing**: Extracts tags from `Tags:` line at the end of content
5. **Smart Publishing**: 
   - Checks for existing posts with the same title
   - Creates new post if none exists
   - Updates existing post if found
6. **State Management**: Saves post IDs and metadata to repository variables for future updates

## 📖 Setup Instructions

### Getting Hashnode Credentials:

1. **Personal Access Token**:
   - Go to [Hashnode](https://hashnode.com) → Settings → Developer
   - Generate Personal Access Token
   - Add as `HASHNODE_PAT` secret

2. **Publication Details**:
   - Go to your publication dashboard
   - Copy Publication ID from the URL or settings
   - Use your publication domain (e.g., `yourblog.hashnode.dev`)

### Getting Dev.to API Key:

1. Go to [Dev.to](https://dev.to) → Settings → Extensions
2. Scroll to "DEV Community API Keys"
3. Generate a new API key
4. Add as `DEV_TO_API_KEY` secret

### Setting up GitHub Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate token with these scopes:
   - `repo` (full repository access)
   - `actions:write` (to update repository variables)
3. Add as `VAR_EDIT_TOKEN_GIT` secret

## 🎯 Usage Examples

### Single Platform:

Hashnode only
uses: gokulnathan66/article-automation/hashnode-publish@main
Dev.to only
uses: gokulnathan66/article-automation/devto-publish@main
text

### Custom Content Path:

uses: gokulnathan66/article-automation/hashnode-publish@main
with:
... other inputs
content-path: 'articles' # Look in 'articles' directory instead
text

### Different Node.js Version:

uses: gokulnathan66/article-automation/devto-publish@main
with:
... other inputs
node-version: '18' # Use Node.js 18 instead of default 24
text

## 🔍 Troubleshooting

### Common Issues:

1. **Action not found**: Ensure repository is public
2. **README not found**: Check content directory path and file exists
3. **API errors**: Verify all secrets are correctly configured
4. **Permission errors**: Ensure GitHub token has required scopes

### Debug Information:

The actions provide comprehensive logging. Check the Actions tab in your repository for detailed execution logs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [GitHub Actions](https://github.com/features/actions)
- Integrates with [Hashnode](https://hashnode.com) and [Dev.to](https://dev.to)
- Inspired by the need for automated content distribution

---

**Made with ❤️ by [Gokul Nathan B](https://github.com/gokulnathan66)**