# Early Autism Awareness

Girl Scout Gold Award Project: Bilingual resources for families on early autism awareness, screening, and intervention support in Northern Virginia / DMV area and global outreach.

---

## How to Build and Review the Site Locally (Without Pushing to GitHub)

This site is built with Jekyll (Ruby static site generator). Source files are located in `docs/` and compile into `_site/`. The underlying build command is:

```bash
bundle exec jekyll build --source docs --destination _site
```

Because default system Ruby on macOS (Ruby 2.6) differs from the project requirement (Ruby 3.3), Docker is the easiest way to build or serve the site without configuring local Ruby version managers.

---

### Option 1: Live Interactive Server with Hot Reload (Recommended for Editing)

Runs Jekyll inside a Ruby 3.3 container. Any edits to Markdown and HTML files in `docs/` will auto-regenerate immediately:

```bash
docker run --rm -it -p 3000:3000 -v "$PWD":/srv/jekyll -w /srv/jekyll ruby:3.3 sh -c "bundle config set path 'vendor/bundle' && bundle exec jekyll serve --source docs --destination _site --host 0.0.0.0 --port 3000"
```

Open in your browser:
* English homepage: `http://localhost:3000/early-autism-awareness/`
* Chinese homepage: `http://localhost:3000/early-autism-awareness/zh/`
* Online screener tool: `http://localhost:3000/early-autism-awareness/screening.html`

---

### Option 2: Build `_site` and Preview with a Lightweight Server

If you want to produce the static output once and preview it:

#### Step A: Build the static site

**Using Docker (no local Ruby 3.3 setup needed):**
```bash
docker run --rm -v "$PWD":/srv/jekyll -w /srv/jekyll ruby:3.3 sh -c "bundle config set path 'vendor/bundle' && bundle install && bundle exec jekyll build --source docs --destination _site"
```

**Using Local Ruby 3.3 (if installed via `mise`, `rbenv`, or Homebrew):**
```bash
bundle install
bundle exec jekyll build --source docs --destination _site
```

#### Step B: Serve the generated `_site` directory

Using `bun`:
```bash
bun x serve _site -p 8080
```

Using Python via `uv`:
```bash
uv run python -m http.server 8080 -d _site
```

Then visit:
* English homepage: `http://localhost:8080/index.html`
* Chinese homepage: `http://localhost:8080/zh/index.html`

---

### Option 3: Testing GitHub Actions Workflow Locally with `act`

You can test `.github/workflows/deploy.yml` locally using `act` without triggering any remote git push or GitHub deployment.

#### 1. Dry-run simulation
Validates workflow syntax, jobs, and runner steps without executing containers:
```bash
act -n --no-cache-server -j build-deploy
```

#### 2. Local execution without pushing to GitHub
Runs the actual build inside local Docker containers:
```bash
act push --no-cache-server -j build-deploy -s GITHUB_TOKEN=dummy
```

#### Why this will NOT push to GitHub:
1. **Token Authentication**: In `.github/workflows/deploy.yml`, the deployment step uses `peaceiris/actions-gh-pages@v3`, which requires authentication via `${{ secrets.GITHUB_TOKEN }}`.
2. **Local Isolation**: Because `act` runs entirely inside your local Docker daemon without access to personal GitHub credentials (or receives a dummy token), the deployment step safely skips or halts without pushing to your remote git repository.
3. **Artifact Containment**: Build artifacts remain strictly within the local environment.

---

### How the Production CI Build Works

In `.github/workflows/deploy.yml`, GitHub Actions runs the exact same Jekyll build on every push to `main`:

```bash
# Injects git metadata into docs/_config.yml
sed -i.bak -e "s/^last_updated:.*/last_updated: \"$(git log -1 --format=%cd --date=format:'%B %d, %Y')\"/" -e "s/^git_sha:.*/git_sha: \"$(git rev-parse --short HEAD)\"/" docs/_config.yml
rm -f docs/_config.yml.bak

# Compiles the static site
bundle exec jekyll build --source docs --destination _site
```

The compiled `_site` directory is then published to GitHub Pages.

---

## Automated Tests

Run the test suite:

```bash
npm test
```
