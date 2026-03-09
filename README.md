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

### AWS Lightsail (Bitnami Node.js Stack)

This section covers deploying the site to an AWS Lightsail instance running the **Bitnami Node.js** stack. It assumes you have already:

- Created a Lightsail instance using the **Node.js (Bitnami)** blueprint
- Attached a static IP to the instance
- Configured your DNS zone and pointed your domain's A record to the static IP

What follows are the steps to perform **after SSHing into the Lightsail server**.

---

#### Step 1 — SSH into the Instance

Use the Lightsail browser-based SSH client, or connect from your local terminal:

```bash
ssh -i /path/to/your-key.pem bitnami@<your-static-ip>
```

---

#### Step 2 — Clone the Repository

```bash
cd /home/bitnami
git clone https://github.com/<your-username>/charlesfredricks-dot-com.git
cd charlesfredricks-dot-com
```

> If using a private repo, set up a deploy key or personal access token first.

---

#### Step 3 — Verify Node.js

The Bitnami Node.js stack comes with Node pre-installed. Confirm it's available:

```bash
node -v
```

You should see a version `>= 14`. If the command isn't found, source the Bitnami environment:

```bash
. /opt/bitnami/scripts/setenv.sh
```

---

#### Step 4 — Set the Port

The included `server.js` defaults to port `8080`. You can override this with the `PORT` environment variable. For the Apache reverse-proxy setup below, **port 8080 is fine** — keep it as is.

Test that the server starts:

```bash
node server.js
```

You should see `Server running at http://localhost:8080/`. Press `Ctrl+C` to stop.

---

#### Step 5 — Install PM2 (Process Manager)

PM2 keeps the Node.js process running in the background and restarts it automatically if it crashes or the instance reboots.

```bash
sudo npm install -g pm2
```

Start the app with PM2:

```bash
cd /home/bitnami/charlesfredricks-dot-com
pm2 start server.js --name "portfolio"
```

Verify it's running:

```bash
pm2 status
```

You should see the `portfolio` process with status `online`.

Configure PM2 to start on boot:

```bash
pm2 startup systemd
```

PM2 will print a command prefixed with `sudo` — **copy and run that exact command**. It will look something like:

```bash
sudo env PATH=$PATH:/opt/bitnami/node/bin pm2 startup systemd -u bitnami --hp /home/bitnami
```

Then save the current process list so PM2 restores it on reboot:

```bash
pm2 save
```

---

#### Step 6 — Configure Apache as a Reverse Proxy

The Bitnami stack includes Apache. You need to (a) enable proxy modules, (b) disable the Bitnami default welcome page, and (c) create a virtual host that forwards traffic to your Node.js app on port 8080.

**6a — Enable proxy modules**

Check whether the modules are already loaded:

```bash
/opt/bitnami/apache/bin/apachectl -M 2>&1 | grep proxy
```

If you see `proxy_module` and `proxy_http_module` in the output, skip to 6b. Otherwise, uncomment them in `httpd.conf`:

```bash
sudo sed -i 's/^#\(LoadModule proxy_module\)/\1/' /opt/bitnami/apache/conf/httpd.conf
sudo sed -i 's/^#\(LoadModule proxy_http_module\)/\1/' /opt/bitnami/apache/conf/httpd.conf
```

**6b — Override the Bitnami default vhosts**

The Bitnami default virtual host serves a welcome page from `/opt/bitnami/apache/htdocs/` using a `_default_` catch-all. You need to modify it so it proxies to your Node.js app instead.

> **Do NOT rename or delete** `/opt/bitnami/apache/htdocs/index.html`. If the proxy directives aren't working yet, removing it causes Apache to show a directory listing — which is a worse failure mode. If you already renamed it, restore it first:
> ```bash
> sudo mv /opt/bitnami/apache/htdocs/index.html.disabled /opt/bitnami/apache/htdocs/index.html
> ```

Open the Bitnami configuration file:

```bash
sudo nano /opt/bitnami/apache/conf/bitnami/bitnami.conf
```

Find the `<VirtualHost _default_:80>` block. Inside it, **comment out** the `DocumentRoot` line, add `Options -Indexes` as a safety net (prevents directory listings if the proxy ever fails), and add proxy directives:

```apache
<VirtualHost _default_:80>
  # DocumentRoot "/opt/bitnami/apache/htdocs"

  <Directory "/opt/bitnami/apache/htdocs">
    Options -Indexes
  </Directory>

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:8080/
  ProxyPassReverse / http://127.0.0.1:8080/
  ...
</VirtualHost>
```

Do the same for the `<VirtualHost _default_:443>` block if one exists — comment out `DocumentRoot`, add the `Options -Indexes` directory block, and add the proxy lines. **Keep all existing SSL directives** (`SSLEngine`, certificate paths, etc.) in place.

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

Restart Apache to test the change in isolation before proceeding:

```bash
sudo /opt/bitnami/ctlscript.sh restart apache
```

Visit your domain. If you see your site instead of the Bitnami welcome page, the proxy is working and you can move on to 6c. If you still see the welcome page, double-check that the `DocumentRoot` line is commented out and that the proxy modules from 6a are loaded.

**6c — Create a named virtual host for your domain**

This ensures Apache matches your domain explicitly:

```bash
sudo nano /opt/bitnami/apache/conf/vhosts/portfolio-vhost.conf
```

Paste the following (replace `yourdomain.com` with your actual domain):

```apache
<VirtualHost *:80>
  ServerName yourdomain.com
  ServerAlias www.yourdomain.com

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:8080/
  ProxyPassReverse / http://127.0.0.1:8080/
</VirtualHost>

<VirtualHost *:443>
  ServerName yourdomain.com
  ServerAlias www.yourdomain.com

  SSLEngine on
  SSLCertificateFile "/opt/bitnami/apache/conf/bitnami/certs/server.crt"
  SSLCertificateKeyFile "/opt/bitnami/apache/conf/bitnami/certs/server.key"

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:8080/
  ProxyPassReverse / http://127.0.0.1:8080/
</VirtualHost>
```

> **Note:** The SSL paths above point to Bitnami's default self-signed certificate. This is a placeholder — Step 7 will replace them with a real Let's Encrypt certificate via the `bncert-tool`.

Save and exit.

**6d — Test and restart Apache**

Verify the configuration is valid:

```bash
sudo /opt/bitnami/apache/bin/apachectl configtest
```

You should see `Syntax OK`. Now restart Apache:

```bash
sudo /opt/bitnami/ctlscript.sh restart apache
```

At this point, visiting `http://yourdomain.com` should serve the site (not the Bitnami welcome page).

---

#### Step 7 — Enable HTTPS with Let's Encrypt

Bitnami includes a helper tool for obtaining free SSL certificates via Let's Encrypt.

```bash
sudo /opt/bitnami/bncert-tool
```

The interactive wizard will:

1. Ask for your domain(s) — enter `yourdomain.com www.yourdomain.com`
2. Ask whether to redirect HTTP to HTTPS — select **Yes**
3. Ask whether to redirect www to non-www (or vice-versa) — choose your preference
4. Obtain and install the certificate
5. Configure automatic renewal via a cron job

After it completes, verify HTTPS works by visiting `https://yourdomain.com`.

---

#### Step 8 — Open Firewall Ports

In the **Lightsail console** (not on the server), go to your instance's **Networking** tab and ensure these ports are open:

| Port | Protocol | Description |
|------|----------|-------------|
| 22   | TCP      | SSH         |
| 80   | TCP      | HTTP        |
| 443  | TCP      | HTTPS       |

These are typically open by default on Bitnami blueprints, but verify to be safe.

---

#### Step 9 — Verify Everything Survives a Reboot

Reboot the instance to confirm the app starts automatically:

```bash
sudo reboot
```

Wait a minute, then SSH back in and check:

```bash
pm2 status
```

The `portfolio` process should be `online`. Visit your domain in a browser to confirm.

---

#### Useful PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Show all running processes |
| `pm2 logs portfolio` | View live logs |
| `pm2 restart portfolio` | Restart the app |
| `pm2 stop portfolio` | Stop the app |
| `pm2 delete portfolio` | Remove from PM2 |

---

#### Updating the Site

To deploy changes after pushing to your repo:

```bash
cd /home/bitnami/charlesfredricks-dot-com
git pull
pm2 restart portfolio
```

If you added new project Markdown files, regenerate the manifest first:

```bash
node scripts/update-manifest.js
pm2 restart portfolio
```

---

#### Troubleshooting

**I see the Bitnami default page instead of my site**

1. Verify proxy modules are loaded:
   ```bash
   /opt/bitnami/apache/bin/apachectl -M 2>&1 | grep proxy
   ```
   You need both `proxy_module` and `proxy_http_module`.

2. Verify your vhost is being loaded:
   ```bash
   /opt/bitnami/apache/bin/apachectl -S 2>&1 | grep yourdomain
   ```
   You should see your domain listed. If not, check that the `Include` line for the vhosts directory exists in `bitnami.conf`:
   ```bash
   grep -r "vhosts" /opt/bitnami/apache/conf/bitnami/bitnami.conf
   ```

3. Make sure the `_default_` vhosts in `bitnami.conf` are not still serving static files — the `DocumentRoot` lines should be commented out and proxy directives added per Step 6b.

4. Check whether your browser is redirecting to HTTPS. If you only configured a port-80 vhost, HTTPS requests will still hit the Bitnami default SSL vhost. Follow Step 6c to add a port-443 vhost.

5. Restart Apache after every change:
   ```bash
   sudo /opt/bitnami/ctlscript.sh restart apache
   ```

**I see "Index of /" with a directory listing**

This means Apache is serving the `/opt/bitnami/apache/htdocs/` directory directly instead of proxying. The most likely causes:

1. The `index.html` file in `htdocs` was renamed or deleted but the proxy directives aren't active. Restore it first:
   ```bash
   sudo mv /opt/bitnami/apache/htdocs/index.html.disabled /opt/bitnami/apache/htdocs/index.html
   ```

2. Ensure the proxy modules are loaded (Step 6a) and that `bitnami.conf` has `DocumentRoot` commented out with proxy directives added (Step 6b).

3. Add `Options -Indexes` to the `htdocs` directory block in `bitnami.conf` to prevent directory listings as a safety net (shown in Step 6b).

4. Restart Apache and test again:
   ```bash
   sudo /opt/bitnami/ctlscript.sh restart apache
   ```

**The site works on the static IP but not the domain**

This usually means you are hitting Node.js on port 8080 directly via the IP (bypassing Apache), while Apache is still serving its default content for your domain. Follow Step 6 from the beginning — 6a (proxy modules), then 6b (modify `bitnami.conf`), then restart and verify before moving to 6c.

**PM2 doesn't restart after reboot**

Make sure you ran both of these:
```bash
pm2 startup systemd   # then run the sudo command it prints
pm2 save
```

Verify with:
```bash
systemctl status pm2-bitnami
```

## License

Free to use and modify for your personal portfolio.