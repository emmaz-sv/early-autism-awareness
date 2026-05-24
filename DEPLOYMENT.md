# Deployment Guide

## GitHub Pages Setup (Option B: Action → gh-pages)

The site uses a GitHub Actions workflow to build Jekyll and deploy to the `gh-pages` branch.

### Steps to enable publishing:

1. **Workflow already triggered**: Push to `main` automatically triggers `.github/workflows/deploy.yml`
   - Builds the Jekyll site from `docs/`
   - Publishes `_site` to the `gh-pages` branch

2. **Enable Pages from gh-pages branch**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Under "Build and deployment":
     - Source: Branch
     - Branch: `gh-pages`
     - Folder: `/ (root)`
   - Click Save

3. **Wait for deployment**:
   - GitHub will detect the `gh-pages` branch and publish the site
   - Public URL will be: https://emmaz-sv.github.io/early-autism-awareness/

### Monitoring builds:

- Watch the Actions tab in your repo to see workflow status
- Each push to `main` will trigger a new build
- Once `gh-pages` is published, visit the site to verify it's live

### Local preview:

To test the site locally before pushing:

```bash
jekyll serve --source docs --watch --baseurl ""
```

Then open http://127.0.0.1:4000/ in your browser.
