# Release Guide

Step-by-step guide to publish Windrunner to npm via GitHub Actions.

## 📋 Prerequisites

1. **npm account** with access to publish `windrunner` package
2. **GitHub repository** with push access
3. **npm token** (classic token with publish permission)

---

## 🔑 Step 1: Create npm Token

### 1.1 Generate Token

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click **"Generate New Token"** → **"Classic Token"**
3. Select **"Automation"** (for CI/CD)
4. Copy the token (starts with `npm_...`)

**⚠️ Important:** Save this token securely. You won't be able to see it again!

### 1.2 Add Token to GitHub Secrets

1. Go to your GitHub repo: https://github.com/Bigetion/windrunner
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **"Add secret"**

---

## 🚀 Step 2: Release Process

### Option A: Automatic Release (via Git Tag)

**This is the easiest way!** Just push a git tag:

```bash
# 1. Make sure you're on master with all changes committed
git checkout master
git status  # Should be clean

# 2. Push to GitHub
git push origin master

# 3. Push the tag (triggers GitHub Action)
git push origin v1.1.0
```

**What happens next:**
1. GitHub Actions detects the tag
2. Runs tests automatically
3. Builds the package
4. Publishes to npm
5. Creates GitHub release

**Check progress:**
- Go to https://github.com/Bigetion/windrunner/actions
- You'll see "Release" workflow running
- Wait ~2-3 minutes for completion

### Option B: Manual Trigger

If you need to re-run the release:

1. Go to https://github.com/Bigetion/windrunner/actions
2. Click **"Release"** workflow
3. Click **"Run workflow"** dropdown
4. Select branch: `master`
5. Click green **"Run workflow"** button

### Option C: Manual Local Publish

If GitHub Actions fails and you need to publish manually:

```bash
# Make sure you're logged in to npm
npm login

# Build the package
npm run build

# Verify everything looks good
npm run test

# Publish
npm publish --access public
```

---

## 📦 Step 3: Verify Publication

### 3.1 Check npm

Visit https://www.npmjs.com/package/windrunner

You should see:
- ✅ Version 1.1.0
- ✅ Updated timestamp
- ✅ README displayed

### 3.2 Test Installation

```bash
# In a new directory
mkdir test-windrunner
cd test-windrunner
npm init -y
npm install windrunner@1.1.0

# Verify
node -e "const w = require('windrunner'); console.log(w)"
```

### 3.3 Check CDN

After ~5 minutes, CDN should update:

https://cdn.jsdelivr.net/npm/windrunner@1.1.0/dist/index.min.js

---

## 🎉 Step 4: Announce Release

### GitHub Release

1. Go to https://github.com/Bigetion/windrunner/releases
2. Click **"Draft a new release"**
3. Choose tag: `v1.1.0`
4. Release title: `v1.1.0: Plugin System + Comprehensive Documentation`
5. Description: Copy from CHANGELOG.md
6. Check **"Set as the latest release"**
7. Click **"Publish release"**

### Optional: Announce on Social Media

**Twitter/X:**
```
🎉 Windrunner v1.1.0 is out!

✨ New Plugin System - Create custom utilities & variants
📚 3,000+ lines of documentation
⚡ React & Next.js integration guides
🎨 3 example plugins included

npm install windrunner

https://github.com/Bigetion/windrunner
```

**Reddit (r/javascript, r/reactjs):**
```
Title: [Release] Windrunner v1.1.0: Plugin System + Comprehensive Docs

Body:
Windrunner is a zero-config Tailwind v4 runtime for the browser. 
No build step required.

What's new in v1.1.0:
- Plugin API for custom utilities and variants
- 3,000+ lines of documentation
- React & Next.js integration guides
- Performance and FOUC prevention guides

Check it out: https://github.com/Bigetion/windrunner
```

---

## ⚠️ Troubleshooting

### Issue: "NPM_TOKEN secret is not configured"

**Solution:**
1. Verify you added the secret correctly
2. Secret name must be exactly `NPM_TOKEN` (case-sensitive)
3. Make sure you're using an Automation token (not Classic with read-only)

### Issue: "You do not have permission to publish"

**Solution:**
1. Check if you're logged in to correct npm account
2. Verify your npm account has access to `windrunner` package
3. If this is a new package, make sure the name is available

### Issue: "Version already published"

**Solution:**
1. You can't re-publish the same version
2. Either:
   - Bump version: `npm version patch` (1.1.1)
   - Or unpublish first: `npm unpublish windrunner@1.1.0` (only within 72 hours)

### Issue: "Tests failed"

**Solution:**
1. Run tests locally: `npm test`
2. Fix any failing tests
3. Commit and push fixes
4. Re-push tag: `git push origin v1.1.0 --force`

---

## 📊 Release Checklist

Before pushing the tag, verify:

- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Version updated in `package.json`
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] All changes committed
- [ ] On master branch
- [ ] No uncommitted changes (`git status`)
- [ ] NPM_TOKEN secret configured in GitHub

After release:

- [ ] npm package published (check npmjs.com)
- [ ] GitHub release created
- [ ] CDN updated (jsdelivr.net)
- [ ] Installation tested
- [ ] Documentation links work
- [ ] Announced (optional)

---

## 🔄 Version Bump Guide

For future releases:

### Patch (1.1.0 → 1.1.1)
Bug fixes only:
```bash
npm version patch
git push origin master
git push origin $(git describe --tags --abbrev=0)
```

### Minor (1.1.0 → 1.2.0)
New features (backward compatible):
```bash
npm version minor
git push origin master
git push origin $(git describe --tags --abbrev=0)
```

### Major (1.1.0 → 2.0.0)
Breaking changes:
```bash
npm version major
git push origin master
git push origin $(git describe --tags --abbrev=0)
```

---

## 📞 Need Help?

- **GitHub Actions logs:** https://github.com/Bigetion/windrunner/actions
- **npm support:** https://www.npmjs.com/support
- **GitHub support:** https://support.github.com

---

**Ready to release v1.1.0?**

```bash
git push origin master
git push origin v1.1.0
```

Then watch the magic happen at:
https://github.com/Bigetion/windrunner/actions
