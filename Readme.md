# Article Automation for success test post 

This project automates the process of synchronizing content between GitHub README files and various blogging platforms.

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
