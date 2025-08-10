
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

