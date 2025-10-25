# Contributing to Domain Details Browser Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Screenshots if applicable

### Suggesting Features

1. Check [Issues](../../issues) for existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork: `git clone git@github.com:YOUR_USERNAME/domain-details-browser-extensions.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

#### Development Setup

```bash
# Clone the repository
git clone git@github.com:simplebytes-com/domain-details-browser-extensions.git
cd domain-details-browser-extensions

# Load in Chrome for testing
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select this directory
```

#### Making Changes

1. **Code Style**
   - Follow existing code style
   - Use meaningful variable names
   - Add comments for complex logic
   - Keep functions focused and small

2. **Testing**
   - Test with various TLDs (.com, .uk, .co.uk, etc.)
   - Test subdomain detection
   - Test edge cases (ports, paths, special characters)
   - Test error handling

3. **Commits**
   - Write clear commit messages
   - Use conventional commit format:
     - `feat: Add new feature`
     - `fix: Fix bug in domain parser`
     - `docs: Update README`
     - `refactor: Improve RDAP client`
     - `style: Format code`
     - `test: Add tests`

#### Pull Request Guidelines

1. **Before submitting:**
   - Test your changes thoroughly
   - Update documentation if needed
   - Update CHANGELOG.md with your changes
   - Ensure code follows project style

2. **PR Description:**
   - Describe what changes you made
   - Explain why the changes are needed
   - Reference any related issues
   - Include screenshots for UI changes

3. **Review Process:**
   - Maintainers will review your PR
   - Address any feedback
   - Once approved, your PR will be merged

## Release Process

### For Maintainers

#### 1. Update Version

Update version in `manifest.json`:
```json
{
  "version": "1.3.0"
}
```

#### 2. Update Changelog

Add new version section to `CHANGELOG.md`:
```markdown
## Version 1.3.0 (2025-10-26)

### New Features
- Feature description

### Bug Fixes
- Bug fix description
```

#### 3. Commit Changes

```bash
git add manifest.json CHANGELOG.md
git commit -m "chore: Bump version to 1.3.0"
git push origin main
```

#### 4. Create and Push Tag

```bash
# Create annotated tag
git tag -a v1.3.0 -m "Release v1.3.0"

# Push tag to GitHub
git push origin v1.3.0
```

#### 5. Automated Release

The GitHub Action will automatically:
- Build the extension ZIP file
- Extract changelog for this version
- Create a GitHub Release
- Upload the ZIP file as a release asset

#### 6. Manual Release (Alternative)

If you prefer manual releases:

```bash
# Build the extension
./build.sh

# Create release on GitHub
# 1. Go to https://github.com/simplebytes-com/domain-details-browser-extensions/releases
# 2. Click "Draft a new release"
# 3. Select tag v1.3.0
# 4. Add title and description from CHANGELOG
# 5. Upload domain-details-extension-v1.3.0.zip
# 6. Publish release
```

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Breaking changes or major features
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes, backward compatible

Examples:
- `v1.2.0` → `v1.2.1`: Bug fix
- `v1.2.0` → `v1.3.0`: New feature
- `v1.2.0` → `v2.0.0`: Breaking change

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## Questions?

- Open an issue for technical questions
- Email: support@domaindetails.com
- Check existing documentation in README.md

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Domain Details! 🎉
