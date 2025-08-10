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