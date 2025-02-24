# Mend Senior Project Web Application

A web application built with SvelteKit and designed in Figma, created as part of a senior project. Deployed and hosted on Vercel.

## 📋 Table of Contents
- [Project Setup](#project-setup)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)
- [QA Testing Guidelines](#qa-testing-guidelines)
- [Bug Reporting](#bug-reporting)

## 🚀 Project Setup

This project is powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

### Creating a New Project

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

### Installing Dependencies

```bash
npm install
# or
pnpm install
# or
yarn
```

## 💻 Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## 🌐 Deployment

This project is deployed on Vercel. Each push to the main branch triggers an automatic deployment.

### Production Environment
- Production URL: [https://mend.vercel.app/]
- Production Branch: main

### Preview Environments
- Every pull request gets a unique preview deployment
- Preview URLs are automatically posted in PR comments
- Great for testing changes before merging to main

> **Note**: Make sure to check the deployment status and preview URLs before merging PRs.

## 🧪 QA Testing Guidelines

### Getting Started with QA Testing

1. **Setup Requirements**
   - Request collaborator access from the development team
   - Familiarize yourself with the GitHub Issues tab

2. **Testing Focus Areas**
   - Design consistency with Figma specifications
   - Functionality testing
   - Responsive design testing
   - User experience evaluation

### Testing Environments
- Production: [https://mend.vercel.app/]
- Preview: Check PR comments for preview URLs
- Local: http://localhost:5173 (when running `npm run dev`)

### Testing Checklist

#### Design Verification
- Compare implementation against Figma designs
- Check spacing, colors, and typography
- Verify responsive behavior
- Test dark/light mode (if applicable)

#### Functionality Testing
- Test all interactive elements
- Complete end-to-end user flows
- Verify edge cases and error states
- Test with various input types

#### Responsive Testing
- Test on different screen sizes
- Check both orientations (landscape/portrait)
- Verify content alignment
- Ensure readability across devices

#### User Experience
- Identify unclear interactions
- Verify feedback mechanisms
- Test loading states
- Review error message clarity

## 🐛 Bug Reporting

### Creating an Issue

1. Navigate to the Issues tab in GitHub
2. Click "New Issue"
3. Select the Bug Report template
4. Fill in all required information:
   - Issue type
   - Page/feature location
   - Current behavior
   - Expected behavior
   - Steps to reproduce
   - Environment details (including deployment environment)
   - Screenshots/recordings
   - Severity level

### Best Practices

1. **Before Reporting**
   - Check if the issue has already been reported
   - Test on different browsers/devices
   - Specify which environment (production/preview/local) the issue was found in
   - Gather all necessary screenshots/recordings

2. **Writing the Report**
   - Use clear, descriptive titles
   - Provide step-by-step reproduction steps
   - Include visual evidence
   - Reference Figma designs when applicable
   - Specify environment details
   - Include deployment URL where issue was found

3. **After Reporting**
   - Respond to any follow-up questions
   - Verify fixes when they're deployed
   - Close issues only after confirmation

### Communication Guidelines

- Use issue comments for questions
- Tag team members using @username
- Reference related issues with #issue-number
- Use appropriate labels
- Keep discussions focused and professional

## 👥 Team Structure

- 1 Project Manager
- 1 UX Researcher
- 1 UX Strategist
- 1 UI/UX Designer
- 2 Developers

## 📝 Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Figma Project Link] (https://www.figma.com/design/uP8xxldybt4ChRB1iiYVON/UI-Design?node-id=2-5&p=f&t=mSRbUnyDYwM2R6r5-0)
