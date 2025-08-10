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
2. Add the PAT as a secret named `VAR_EDIT_TOKEN_GIT` (or change the workflow accordingly).
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
