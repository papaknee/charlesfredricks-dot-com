# Terminal Portfolio Website

A minimalist, terminal-themed personal portfolio website built with **Next.js**. Navigate using command-line interface commands or mouse clicks.

## Features

- 🖥️ Dark-mode terminal interface
- ⌨️ Keyboard navigation with terminal commands
- 🖱️ Click-based navigation for ease of use
- 📁 Hierarchical file system structure
- 🔗 URL routing for direct access to content
- 📝 Markdown-driven project pages — add a `.md` file, no code editing required
- 🖼️ Inline images and links in content
- ⚡ Built with Next.js for server-side rendering and optimized production builds

## Prerequisites

- **Node.js** version 18.18.0 or later
- **npm** (included with Node.js)

## Local Development

### Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The development server supports hot-reloading — changes to components and styles are reflected immediately without a manual refresh.

### Production Build (Local Testing)

To test the production build locally:

```bash
npm run build
npm start
```

This builds the optimized production bundle and starts the Next.js production server on [http://localhost:3000](http://localhost:3000).

### Available Commands (In the Terminal UI)

- `ls` - List directory contents
- `cd [directory]` - Change directory
- `cat [file]` - Display file contents
- `clear` - Clear the terminal
- `help` - Show available commands
- `pwd` - Print working directory

### Navigation

The website presents a terminal interface where you can:

- Click on directories (shown in blue) to navigate into them
- Click on files to view their contents
- Use the `cd` command to navigate directories
- Use the `cat` command to view file contents
- Use `cd ..` to go back to the parent directory
- Use ↑/↓ arrow keys to cycle through command history

## Project Structure

```
├── app/                        # Next.js App Router
│   ├── layout.js               # Root layout (HTML shell, metadata)
│   ├── globals.css             # Global terminal styles
│   └── [[...slug]]/
│       └── page.js             # Catch-all route — renders Terminal
├── src/
│   ├── components/
│   │   └── Terminal.js         # Main terminal React component
│   └── lib/
│       └── filesystem.js       # Virtual filesystem & project loader
├── public/
│   └── content/
│       └── projects/           # Markdown project files + manifest
│           ├── manifest.json
│           └── *.md
├── scripts/
│   └── update-manifest.js      # Regenerates manifest.json
├── next.config.js
├── jsconfig.json
└── package.json
```

## Adding New Pages/Articles

### Adding a Project Article (Markdown)

Project pages live in `public/content/projects/` as Markdown files. The filename determines the date and URL slug:

```
public/content/projects/YYYY-MM-DD-my-project-name.md
```

**Steps:**

1. Create your Markdown file:

   ```
   public/content/projects/2025-06-01-my-new-project.md
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
   npm run update-manifest
   ```

3. Refresh the browser — the project appears under `ls /home/projects`, sorted newest-first.

The Markdown file is fetched and rendered in the browser on first access (lazy-loaded), so no additional build step is needed.

---

### Adding a Simple Page (like About or Contact)

Non-project pages (e.g. `about`, `contact`) are defined in the `createFileSystem()` function inside `src/lib/filesystem.js`:

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

Edit `app/globals.css` to customize the terminal colors:

- Background: `#1e1e1e`
- Text: `#d4d4d4`
- Prompt: `#4ec9b0`
- Directories: `#569cd6`
- Errors: `#f48771`

### Changing the Prompt

Edit the prompt text in `src/components/Terminal.js`. Search for `guest@charlesfredricks.com` and replace it with your desired prompt.

## Deployment

### Vercel (Recommended)

The easiest way to deploy a Next.js app is on [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Vercel detects Next.js automatically — no extra configuration needed.
4. Your site is live with automatic deployments on every push.

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

#### Step 2 — Clone the Repository and Install Dependencies

```bash
cd /home/bitnami
git clone https://github.com/<your-username>/charlesfredricks-dot-com.git
cd charlesfredricks-dot-com
npm install
```

> If using a private repo, set up a deploy key or personal access token first.

---

#### Step 3 — Verify Node.js

The Bitnami Node.js stack comes with Node pre-installed. Confirm it's available:

```bash
node -v
```

You should see a version `>= 18.18.0`. If the command isn't found, source the Bitnami environment:

```bash
. /opt/bitnami/scripts/setenv.sh
```

---

#### Step 4 — Build the Production Bundle

Next.js requires a build step before running in production:

```bash
npm run build
```

Test that the production server starts:

```bash
npm start
```

You should see `▲ Next.js 15.x.x` and `✓ Ready in ...`. The server listens on port `3000` by default. Press `Ctrl+C` to stop.

---

#### Step 5 — Install PM2 (Process Manager)

PM2 keeps the Node.js process running in the background and restarts it automatically if it crashes or the instance reboots.

```bash
sudo npm install -g pm2
```

Start the app with PM2:

```bash
cd /home/bitnami/charlesfredricks-dot-com
pm2 start npm --name "portfolio" -- start
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

The Bitnami stack includes Apache. You need to (a) enable proxy modules, (b) disable the Bitnami default welcome page, and (c) create a virtual host that forwards traffic to your Next.js app on port 3000.

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

The Bitnami default virtual host serves a welcome page from `/opt/bitnami/apache/htdocs/` using a `_default_` catch-all. You need to modify it so it proxies to your Next.js app instead.

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
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
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
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>

<VirtualHost *:443>
  ServerName yourdomain.com
  ServerAlias www.yourdomain.com

  SSLEngine on
  SSLCertificateFile "/opt/bitnami/apache/conf/bitnami/certs/server.crt"
  SSLCertificateKeyFile "/opt/bitnami/apache/conf/bitnami/certs/server.key"

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

> **Note:** The SSL paths above point to Bitnami's default self-signed certificate and are **temporary placeholders**. After `bncert-tool` runs in Step 7, it updates `bitnami.conf` but does **not** update this custom vhost file. Because Apache matches a named vhost over the `_default_:443` catch-all, HTTPS traffic is served by this vhost — with the self-signed cert — until you complete Step 7b.

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

After it completes, the certificate is issued and `bitnami.conf` is updated — but the custom vhost still holds the old self-signed paths. Complete Step 7b to fix that.

---

#### Step 7b — Restore the Custom Vhost with the Let's Encrypt Certificate

The `bncert-tool` clears `portfolio-vhost.conf` as part of its process and only updates `/opt/bitnami/apache/conf/bitnami/bitnami.conf`. This means the proxy directives and SSL config you added in Step 6c are gone. Because Apache prefers a named vhost over the `_default_:443` catch-all, HTTPS traffic hits this now-empty `portfolio-vhost.conf` — serving the Bitnami default page with no proxy — until you restore the full configuration.

Open the file:

```bash
sudo nano /opt/bitnami/apache/conf/vhosts/portfolio-vhost.conf
```

Replace the **entire contents** of the file with the following (substituting your actual domain):

```apache
<VirtualHost *:80>
  ServerName yourdomain.com
  ServerAlias www.yourdomain.com

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>

<VirtualHost *:443>
  ServerName yourdomain.com
  ServerAlias www.yourdomain.com

  SSLEngine on
  SSLCertificateFile "/opt/bitnami/letsencrypt/certificates/yourdomain.com.crt"
  SSLCertificateKeyFile "/opt/bitnami/letsencrypt/certificates/yourdomain.com.key"

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Save and exit. Test and restart Apache:

```bash
sudo /opt/bitnami/apache/bin/apachectl configtest
sudo /opt/bitnami/ctlscript.sh restart apache
```

Visit `https://yourdomain.com` — the browser should show your portfolio with a valid certificate (padlock, no security warning).

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
npm install
npm run build
pm2 restart portfolio
```

If you added new project Markdown files, regenerate the manifest first:

```bash
npm run update-manifest
npm run build
pm2 restart portfolio
```

---

### Backing Up and Restoring Let's Encrypt Certificates

Let's Encrypt has [rate limits](https://letsencrypt.org/docs/rate-limits/) — most notably a limit of **5 duplicate certificates per week** per set of domain names. If you delete and recreate your Lightsail instance frequently, you can hit these limits and be temporarily blocked from obtaining new certificates.

The solution is to **back up your certificate files** to a location outside the instance (e.g. your local machine, S3 bucket, or another server) so you can restore them on a fresh instance instead of requesting new ones.

#### What to Back Up

The `bncert-tool` uses [Lego](https://go-acme.github.io/lego/) (the Let's Encrypt client bundled with Bitnami) behind the scenes. The key files live in these directories:

| Path | Contents |
|------|----------|
| `/opt/bitnami/letsencrypt/certificates/` | The issued certificate (`.crt`), private key (`.key`), and issuer cert (`.issuer.crt`) |
| `/opt/bitnami/apache/conf/bitnami/certs/` | Symlinks or copies that Apache actually reads at runtime |
| `/opt/bitnami/letsencrypt/accounts/` | Your Let's Encrypt account registration (ACME account key) |

> **Important:** The `accounts/` directory contains the private key tied to your Let's Encrypt account. Without it, Lego cannot renew or revoke certificates it previously issued. Always include it in your backup.

#### Backing Up (from the Lightsail Instance)

Create a compressed archive of all three directories:

```bash
sudo tar czf /home/bitnami/letsencrypt-backup.tar.gz \
  /opt/bitnami/letsencrypt/certificates/ \
  /opt/bitnami/letsencrypt/accounts/ \
  /opt/bitnami/apache/conf/bitnami/certs/
```

Then copy the archive to your local machine (or an S3 bucket):

```bash
# From your local machine:
scp -i /path/to/your-key.pem bitnami@<your-static-ip>:/home/bitnami/letsencrypt-backup.tar.gz ./

# Or to an S3 bucket (if AWS CLI is configured on the instance):
aws s3 cp /home/bitnami/letsencrypt-backup.tar.gz s3://your-bucket/backups/
```

> **Tip:** Automate this with a cron job that runs after each renewal. The Bitnami auto-renewal cron is typically at `/etc/cron.d/bitnami-letsencrypt` — you can add a post-renewal hook or a separate cron entry:
> ```bash
> # Example: back up certs to S3 daily at 4:00 AM
> 0 4 * * * root tar czf /tmp/le-backup.tar.gz /opt/bitnami/letsencrypt/certificates/ /opt/bitnami/letsencrypt/accounts/ /opt/bitnami/apache/conf/bitnami/certs/ && aws s3 cp /tmp/le-backup.tar.gz s3://your-bucket/backups/letsencrypt-backup.tar.gz && rm /tmp/le-backup.tar.gz
> ```

#### Restoring on a New Instance

After creating a fresh Lightsail instance and completing Steps 1–6 (clone, build, PM2, Apache proxy), restore the certificates **instead of** running `bncert-tool`:

1. Copy the backup archive to the new instance:

   ```bash
   # From your local machine:
   scp -i /path/to/your-key.pem ./letsencrypt-backup.tar.gz bitnami@<new-static-ip>:/home/bitnami/

   # Or from S3:
   aws s3 cp s3://your-bucket/backups/letsencrypt-backup.tar.gz /home/bitnami/
   ```

2. Extract the archive (this restores certificates, keys, and the ACME account):

   ```bash
   sudo tar xzf /home/bitnami/letsencrypt-backup.tar.gz -C /
   ```

3. Verify the certificate files are in place:

   ```bash
   ls -la /opt/bitnami/letsencrypt/certificates/
   ls -la /opt/bitnami/apache/conf/bitnami/certs/
   ```

   You should see your domain's `.crt` and `.key` files.

4. Make sure your Apache vhost points to the correct certificate paths. If the `bncert-tool` was used on the original instance, it likely updated `bitnami.conf` to point to the Lego-managed certificate. Check:

   ```bash
   grep -i sslcertificate /opt/bitnami/apache/conf/bitnami/bitnami.conf
   ```

   If the paths don't match the restored files, update them:

   ```bash
   sudo nano /opt/bitnami/apache/conf/bitnami/bitnami.conf
   ```

   Set the paths to:
   ```apache
   SSLCertificateFile "/opt/bitnami/letsencrypt/certificates/yourdomain.com.crt"
   SSLCertificateKeyFile "/opt/bitnami/letsencrypt/certificates/yourdomain.com.key"
   ```

   Do the same in your domain vhost file (`/opt/bitnami/apache/conf/vhosts/portfolio-vhost.conf`).

5. Restart Apache:

   ```bash
   sudo /opt/bitnami/ctlscript.sh restart apache
   ```

6. Verify HTTPS works by visiting `https://yourdomain.com`.

7. Re-enable automatic renewal. The `bncert-tool` creates a cron job for this, but on a fresh instance it won't exist. Create it manually:

   ```bash
   sudo nano /etc/cron.d/bitnami-letsencrypt
   ```

   Add:

   ```
   # Renew Let's Encrypt certificates at 3:01 AM on the 1st and 15th of each month
   1 3 1,15 * * root /opt/bitnami/letsencrypt/lego --path /opt/bitnami/letsencrypt --email="your-email@example.com" --domains="yourdomain.com" --domains="www.yourdomain.com" --http --http.webroot /opt/bitnami/apache/htdocs renew && /opt/bitnami/ctlscript.sh restart apache
   ```

   > Replace `your-email@example.com` and domain names with your actual values. The `--http.webroot` path may vary — check how the original cron was configured if you still have access.

#### Rate Limit Tips

- **Back up early and often.** The first thing to do after a successful `bncert-tool` run is back up.
- **Use staging for testing.** If you're experimenting with SSL setup, use Let's Encrypt's [staging environment](https://letsencrypt.org/docs/staging-environment/) which has much higher rate limits. Lego supports this with the `--server` flag.
- **Duplicate certificate limit** is 5 per week for the exact same set of domain names. If you hit it, you must wait up to 7 days — restoring from backup avoids this entirely.
- **Failed validation limit** is 5 per hour per account per hostname. Double-check DNS and firewall before requesting a certificate.

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

This usually means you are hitting Node.js on port 3000 directly via the IP (bypassing Apache), while Apache is still serving its default content for your domain. Follow Step 6 from the beginning — 6a (proxy modules), then 6b (modify `bitnami.conf`), then restart and verify before moving to 6c.

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