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


# calling the publicshed workflow
name: Auto publish on hashnode

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    uses: YOUR_USERNAME/YOUR_REPO/.github/workflows/hashnode-publish-reusable.yml@main
    secrets:
      HASHNODE_PAT: ${{ secrets.HASHNODE_PAT }}
      HASHNODE_PUBLICATION_ID: ${{ secrets.HASHNODE_PUBLICATION_ID }}
      HASHNODE_PUBLICATION_HOST: ${{ secrets.HASHNODE_PUBLICATION_HOST }}
      VAR_EDIT_TOKEN_GIT: ${{ secrets.VAR_EDIT_TOKEN_GIT }}

# Dev.to Auto Publisher

## Setup Instructions

1. **Get your Dev.to API Key:**
   - Go to Dev.to Settings → Extensions → DEV Community API Keys
   - Generate a new API key

2. **Set up GitHub Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `DEV_TO_API_KEY`: Your Dev.to API Key
     - `VAR_EDIT_TOKEN_GIT`: GitHub token with repository access

3. **Create your content structure** (document your expected file structure)

4. **Push to main branch** to trigger automatic publishing

## How to get Dev.to API Key

1. Log in to Dev.to
2. Go to Settings (click your profile picture → Settings)
3. Navigate to "Extensions" section
4. Scroll down to "DEV Community API Keys"
5. Click "Generate API Key"
6. Copy the generated key and add it to your GitHub secrets

name: Auto publish on dev.to

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    uses: YOUR_USERNAME/YOUR_REPO/.github/workflows/devto-publish-reusable.yml@main
    secrets:
      DEV_TO_API_KEY: ${{ secrets.DEV_TO_API_KEY }}
      VAR_EDIT_TOKEN_GIT: ${{ secrets.VAR_EDIT_TOKEN_GIT }}
