# Terminal Portfolio Website

A minimalist, terminal-themed personal portfolio website that can be navigated using command-line interface commands or mouse clicks.

## Features

- 🖥️ Dark-mode terminal interface
- ⌨️ Keyboard navigation with terminal commands
- 🖱️ Click-based navigation for ease of use
- 📁 Hierarchical file system structure
- 🔗 URL routing for direct access to content
- 📝 Markdown-driven project pages — add a `.md` file, no code editing required
- 🖼️ Inline images and links in content

## Usage

### Local Development

For local development with full URL routing support, use the included Node.js development server:

```bash
node server.js
```

This will start a server at `http://localhost:8080` that properly handles client-side routing.

Alternatively, you can use any static file server, but note that direct URL access (e.g., `/about`, `/projects/2024/12/15/article`) will only work with a server configured to serve `index.html` for all routes.

### Simple Testing

For quick testing without URL routing, you can open `index.html` directly in a browser. However, direct URL navigation won't work in this mode.

### Available Commands

- `ls` - List directory contents
- `cd [directory]` - Change directory
- `cat [file]` - Display file contents
- `clear` - Clear the terminal
- `help` - Show available commands
- `pwd` - Print working directory

### Navigation

The website will present a terminal interface where you can:

- Click on directories (shown in blue) to navigate into them
- Click on files to view their contents
- Use the `cd` command to navigate directories
- Use the `cat` command to view file contents
- Use `cd ..` to go back to the parent directory

## Adding New Pages/Articles

### Adding a Project Article (Markdown)

Project pages live in `content/projects/` as Markdown files. The filename determines the date and URL slug:

```
content/projects/YYYY-MM-DD-my-project-name.md
```

**Steps:**

1. Create your Markdown file:

   ```
   content/projects/2025-06-01-my-new-project.md
   ```

   ```markdown
   # My New Project

   A short description of what this project does.

   ## Features

   - Feature one
   - Feature two

   ## Technologies

   React, Node.js, PostgreSQL

   View on [GitHub](https://github.com/username/repo)
   ```

2. Regenerate the manifest so the site picks it up:

   ```bash
   node scripts/update-manifest.js
   ```

3. Refresh the browser — the project appears under `ls /home/projects`, sorted newest-first.

The Markdown file is fetched and rendered in the browser on first access (lazy-loaded), so no build step is needed.

---

### Adding a Simple Page (like About or Contact)

Non-project pages (e.g. `about`, `contact`) are still defined directly in the `fileSystem` object inside `terminal.js`:

```javascript
'your-page-name': {
    type: 'file',
    content: `<h1>Your Page Title</h1>
<div class="article-content">
<p>Your content here. Standard HTML is supported.</p>
<p>Add links: <a href="https://example.com" target="_blank">Link Text</a></p>
</div>`
}
```

> **Note:** A future improvement could extend the Markdown system to these pages as well.

## URL Structure

The website supports direct URL access:

- `/` - Home directory (shows ls of /home)
- `/about` - About page
- `/contact` - Contact page
- `/projects` - List of all projects (sorted by date, newest first)
- `/projects/YYYY/MM/DD/article-name` - Specific project article

## Customization

### Changing Colors

Edit `style.css` to customize the terminal colors:

- Background: `#1e1e1e`
- Text: `#d4d4d4`
- Prompt: `#4ec9b0`
- Directories: `#569cd6`
- Errors: `#f48771`

### Changing the Prompt

Edit the prompt text in both `index.html` and the `updatePrompt()` function in `terminal.js`:

```javascript
document.querySelector('.prompt').textContent = `your-prompt-text$ `;
```

## Browser Compatibility

This website works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid/Flexbox
- HTML5

## Deployment

### Static Hosting Platforms

This website can be deployed to any static hosting platform. However, you need to configure the platform to serve `index.html` for all routes to enable direct URL access.

#### Netlify

Create a `_redirects` file in the root directory with:

```
/*    /index.html   200
```

#### Vercel

Create a `vercel.json` file in the root directory with:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### GitHub Pages

GitHub Pages doesn't natively support client-side routing. You can use a workaround by creating a `404.html` file that redirects to `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/index.html'">
</head>
</html>
```

Then update the initialization code in `terminal.js` to check for redirected URLs.

#### Apache

Add this to your `.htaccess` file:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx

Add this to your nginx configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Node.js Hosting

If you deploy to a Node.js hosting platform (like Heroku, Railway, or DigitalOcean App Platform), you can use the included `server.js`:

1. Add a `package.json` file:

```json
{
  "name": "terminal-portfolio",
  "version": "1.0.0",
  "description": "Terminal-themed portfolio website",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=14"
  }
}
```

2. Deploy with `npm start` as the start command.

## License

Free to use and modify for your personal portfolio.