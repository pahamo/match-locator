# Automated Versioning System

This project uses an automated versioning system that increments versions based on conventional commit messages and maintains both technical and user-friendly changelogs.

## 🎯 How It Works

The system automatically:
- **Increments versions** based on commit message prefixes
- **Updates package.json** with the new version
- **Updates the version badge** in index.html
- **Maintains technical changelog** (CHANGELOG.md) for developers
- **Maintains user-friendly changelog** (changelog.html) for users
- **Stages and commits changes** automatically

## 📋 Commit Message Format

Use these prefixes to control version bumping:

### 🔢 Version Bumping Rules

| Prefix | Version Bump | Description | Example |
|--------|-------------|-------------|---------|
| `feat:` | **Minor** (x.Y.x) | New features | `feat: add dark mode toggle` |
| `fix:` | **Patch** (x.x.Y) | Bug fixes | `fix: resolve timezone display bug` |
| `BREAKING:` | **Major** (X.x.x) | Breaking changes | `BREAKING: remove deprecated API` |
| `docs:` | **Patch** (x.x.Y) | Documentation updates | `docs: update API documentation` |
| `style:` | **Patch** (x.x.Y) | UI/styling changes | `style: improve button hover effects` |
| `refactor:` | **Patch** (x.x.Y) | Code refactoring | `refactor: simplify user auth logic` |
| `perf:` | **Patch** (x.x.Y) | Performance improvements | `perf: optimize database queries` |
| `test:` | **Patch** (x.x.Y) | Testing updates | `test: add unit tests for auth` |
| `build:` | **Patch** (x.x.Y) | Build system changes | `build: update webpack config` |
| `ci:` | **Patch** (x.x.Y) | CI/CD changes | `ci: add automated deployment` |
| `chore:` | **Patch** (x.x.Y) | Maintenance tasks | `chore: update dependencies` |

### 📝 Commit Message Examples

```bash
# Good examples - these will trigger version bumps:
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve mobile navigation bug"
git commit -m "BREAKING: remove support for Internet Explorer"
git commit -m "style: redesign match cards with glassmorphism"
git commit -m "perf: optimize fixture loading performance"

# Regular commits - no version bump:
git commit -m "update README with new instructions"
git commit -m "refactor variable names for clarity"
```

## 🛠️ Manual Version Management

### Using the Version Manager Script

```bash
# Show current version and next possible versions
npm run version current

# Bump version manually
npm run version bump patch   # 1.5.0 → 1.5.1
npm run version bump minor   # 1.5.0 → 1.6.0  
npm run version bump major   # 1.5.0 → 2.0.0

# Show commit message guide
npm run version guide

# Check version system status
npm run version check
```

### Manual Version Updates

If you need to update versions without using conventional commits:

1. **Use explicit version in commit message:**
   ```bash
   git commit -m "release version 2.0.0"
   git commit -m "bump to v1.5.3"
   ```

2. **Use the version manager script:**
   ```bash
   npm run version bump minor
   ```

## 📁 File Structure

The versioning system manages these files:

```
├── config/package.json          # Source of truth for version
├── src/index.html               # Version badge updated automatically
├── src/changelog.html           # User-friendly changelog
├── CHANGELOG.md                 # Technical changelog for developers
├── docs/CLAUDE.md              # Project documentation with recent changes
├── scripts/version-manager.js   # Manual version management utility
└── .git/hooks/post-commit      # Automated versioning hook
```

## 🔄 Git Hook Workflow

The `post-commit` hook automatically:

1. **Analyzes commit message** for version bump indicators
2. **Calculates new version** based on current version + bump type
3. **Updates package.json** with new version number
4. **Updates index.html** version badge
5. **Updates CHANGELOG.md** with technical details
6. **Updates changelog.html** with user-friendly descriptions
7. **Updates CLAUDE.md** with recent changes
8. **Stages all changes** and commits them (if version changed)

## 🎨 User-Friendly Features

### Version Badge
- **Clickable badge** in bottom-right corner of main app
- **Animated pulse indicator** for new versions
- **Links directly to changelog page**
- **Hover effects** with smooth transitions

### Changelog Page (`src/changelog.html`)
- **Clean, modern design** matching main app
- **Categorized changes** (New Features, Bug Fixes, Improvements, etc.)
- **User-friendly descriptions** instead of technical commit messages
- **"What's Coming Next"** section for unreleased changes
- **Responsive design** for mobile and desktop

## 🚀 Best Practices

### For Developers

1. **Use conventional commit messages** consistently
2. **Keep commit messages descriptive** but concise
3. **Group related changes** in single commits when possible
4. **Use the version manager** for manual version bumps
5. **Check git status** before version bumps (`npm run version check`)

### For Version Releases

1. **Test thoroughly** before committing features
2. **Use `feat:` prefix** for new user-facing features
3. **Use `fix:` prefix** for bug fixes
4. **Use `BREAKING:` prefix** sparingly and document changes
5. **Review changelog** after commits to ensure accuracy

## 🔧 Troubleshooting

### Common Issues

**Hook not executing:**
```bash
# Check if hook is executable
ls -la .git/hooks/post-commit
# Make executable if needed
chmod +x .git/hooks/post-commit
```

**Version not updating:**
```bash
# Check current version status
npm run version check
# Verify package.json path
cat config/package.json | grep version
```

**Changelog not updating:**
```bash
# Check if files exist and are writable
npm run version check
# Manually test hook
.git/hooks/post-commit
```

### Reset Version System

If you need to reset or fix the version system:

```bash
# Check system status
npm run version check

# Manually bump version to fix sync issues
npm run version bump patch

# Or directly edit package.json and commit
# The next conventional commit will sync everything
```

## 📊 Version History

The system maintains version history in multiple formats:

- **CHANGELOG.md**: Technical changelog with commit hashes
- **changelog.html**: User-friendly web interface  
- **git tags**: Automatic git tags for each version (future feature)
- **package.json**: Single source of truth for current version

## 🎯 Future Enhancements

Planned improvements to the versioning system:

- [ ] Automatic git tagging on version bumps
- [ ] Release notes generation from changelog
- [ ] Integration with GitHub releases
- [ ] Version comparison tools
- [ ] Rollback capabilities
- [ ] Branch-specific versioning rules

---

For questions or issues with the versioning system, check the troubleshooting section above or run `npm run version check` to diagnose problems.