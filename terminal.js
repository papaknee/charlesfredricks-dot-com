// File system structure
const fileSystem = {
    '/home': {
        type: 'directory',
        contents: {
            'about': {
                type: 'file',
                content: `<h1>Personal Site of Charles Fredricks</h1>
<div class="article-content">
<p>I'm a person, based in Washington State with varied interests and hobbies.</p>
<p>This website is designed to mimic a terminal experience</p>
<p>Explore using commands like:</p>
<ul>
  <li>ls - list directory contents</li>
  <li>cd [directory] - change directory</li>
  <li>cat [file] - display file contents</li>
  <li>clear - clear the terminal</li>
  <li>help - show available commands</li>
</ul>
</div>`
            },
            'contact': {
                type: 'file',
                content: `<h1>Contact Information</h1>
<div class="article-content">
<p>If you must reach out, do so through one of these channels:</p>
<p>Email: <a href="mailto:charles@charlesfredricks.com">charles@charlesfredricks.com</a></p>
<p>GitHub: <a href="https://github.com/papaknee" target="_blank">github.com/papaknee</a></p>
<p>LinkedIn: <a href="https://www.linkedin.com/in/charles-fredricks-80411526" target="_blank">https://www.linkedin.com/in/charles-fredricks-80411526</a></p>
</div>`
            },
            'projects': {
                type: 'directory',
                contents: {}
            }
        }
    }
};

// Terminal state
let currentPath = '/home';
let commandHistory = [];
let historyIndex = -1;

// Helper functions
function resolvePath(path) {
    if (path.startsWith('/')) {
        return path;
    }
    
    let parts = currentPath.split('/').filter(p => p);
    let newParts = path.split('/').filter(p => p);
    
    for (let part of newParts) {
        if (part === '..') {
            parts.pop();
        } else if (part !== '.') {
            parts.push(part);
        }
    }
    
    return '/' + parts.join('/');
}

function getNode(path) {
    // Handle root case
    if (path === '' || path === '/') {
        return fileSystem;
    }
    
    // If the path exists directly in fileSystem, return it
    if (fileSystem[path]) {
        return fileSystem[path];
    }
    
    // Start from /home if we have a path starting with /
    let parts = path.split('/').filter(p => p);
    let current = fileSystem['/home'];
    
    // If we're looking for exactly /home, return it
    if (parts.length === 1 && parts[0] === 'home') {
        return current;
    }
    
    // Skip 'home' if it's the first part since we're already at /home
    if (parts[0] === 'home') {
        parts.shift();
    }
    
    for (let part of parts) {
        if (current.contents && current.contents[part]) {
            current = current.contents[part];
        } else {
            return null;
        }
    }
    
    return current;
}

function getProjectArticles() {
    const articles = [];
    
    function traverse(node, path) {
        if (node.type === 'file' && path.startsWith('/home/projects/')) {
            const pathParts = path.split('/').filter(p => p);
            if (pathParts.length >= 5) { // home/projects/YYYY/MM/DD/title
                const year = pathParts[2];
                const month = pathParts[3];
                const day = pathParts[4];
                const title = pathParts.slice(5).join('/');
                articles.push({
                    path: path,
                    title: title,
                    date: `${year}-${month}-${day}`,
                    timestamp: new Date(`${year}-${month}-${day}`).getTime()
                });
            }
        } else if (node.type === 'directory' && node.contents) {
            for (let key in node.contents) {
                traverse(node.contents[key], path + '/' + key);
            }
        }
    }
    
    const projectsNode = getNode('/home/projects');
    if (projectsNode) {
        traverse(projectsNode, '/home/projects');
    }
    
    articles.sort((a, b) => b.timestamp - a.timestamp);
    return articles;
}

// Load projects from content/projects/manifest.json and populate the fileSystem tree
async function loadProjects() {
    try {
        const res = await fetch('/content/projects/manifest.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const files = await res.json();

        const projectsNode = fileSystem['/home'].contents.projects;

        for (const filename of files) {
            // Filename format: YYYY-MM-DD-slug.md
            const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
            if (!match) continue;
            const [, year, month, day, slug] = match;

            const c = projectsNode.contents;
            if (!c[year])                    c[year]                    = { type: 'directory', contents: {} };
            if (!c[year].contents[month])    c[year].contents[month]    = { type: 'directory', contents: {} };
            if (!c[year].contents[month].contents[day])
                                             c[year].contents[month].contents[day] = { type: 'directory', contents: {} };

            c[year].contents[month].contents[day].contents[slug] = {
                type: 'file',
                content: null,   // lazy-loaded on first cat
                filename: filename
            };
        }
    } catch (e) {
        console.error('Failed to load projects manifest:', e);
    }
}

// Output functions
function addOutput(text, className = '') {
    const output = document.getElementById('output');
    const line = document.createElement('div');
    line.className = 'output-line' + (className ? ' ' + className : '');
    
    if (typeof text === 'string') {
        line.innerHTML = text;
    } else {
        line.appendChild(text);
    }
    
    output.appendChild(line);
    scrollToBottom();
}

function addCommand(cmd) {
    addOutput(`<span class="prompt">guest@charlesfredricks.com:${currentPath}$</span> <span class="command">${cmd}</span>`);
}

function scrollToBottom() {
    const terminal = document.getElementById('terminal');
    terminal.scrollTop = terminal.scrollHeight;
}

function updatePrompt() {
    document.querySelector('.prompt').textContent = `guest@charlesfredricks.com:${currentPath}$ `;
}

// Commands
const commands = {
    ls: function(args) {
        const path = args.length > 0 ? resolvePath(args[0]) : currentPath;
        const node = getNode(path);
        
        if (!node) {
            const targetPath = args.length > 0 ? args[0] : path;
            addOutput(`ls: cannot access '${targetPath}': No such file or directory`, 'error');
            return;
        }
        
        if (node.type === 'file') {
            addOutput(path.split('/').pop());
            return;
        }
        
        if (!node.contents) {
            return;
        }
        
        // Special handling for projects directory - show articles sorted by date
        if (path === '/home/projects') {
            const articles = getProjectArticles();
            if (articles.length === 0) {
                addOutput('No projects found');
                return;
            }
            
            articles.forEach(article => {
                const link = document.createElement('span');
                link.className = 'file';
                link.textContent = `${article.date} - ${article.title}`;
                // Extract the path relative to /home/projects
                const relativePath = article.path.replace('/home/projects/', '');
                link.onclick = () => executeCommand(`cat ${relativePath}`);
                addOutput(link);
            });
            return;
        }
        
        const entries = Object.keys(node.contents).sort();
        entries.forEach(entry => {
            const item = node.contents[entry];
            if (item.type === 'directory') {
                const link = document.createElement('span');
                link.className = 'directory';
                link.textContent = entry + '/';
                link.onclick = () => executeCommand(`cd ${entry}`);
                addOutput(link);
            } else {
                const link = document.createElement('span');
                link.className = 'file';
                link.textContent = entry;
                link.onclick = () => executeCommand(`cat ${entry}`);
                addOutput(link);
            }
        });
    },
    
    cd: function(args) {
        if (args.length === 0) {
            currentPath = '/home';
            updatePrompt();
            return;
        }
        
        const newPath = resolvePath(args[0]);
        const node = getNode(newPath);
        
        if (!node) {
            addOutput(`cd: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        
        if (node.type !== 'directory') {
            addOutput(`cd: ${args[0]}: Not a directory`, 'error');
            return;
        }
        
        currentPath = newPath;
        updatePrompt();
        
        // Update URL
        const urlPath = newPath.replace('/home', '').replace(/^\//, '') || '/';
        history.pushState({ path: currentPath }, '', urlPath === '/' ? '/' : '/' + urlPath);
        
        // Auto-run ls for projects directory
        if (currentPath === '/home/projects') {
            commands.ls([]);
        }
    },
    
    cat: async function(args) {
        if (args.length === 0) {
            addOutput('cat: missing file operand', 'error');
            return;
        }
        
        const path = resolvePath(args[0]);
        const node = getNode(path);
        
        if (!node) {
            addOutput(`cat: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        
        if (node.type === 'directory') {
            addOutput(`cat: ${args[0]}: Is a directory`, 'error');
            return;
        }

        // Lazy-load markdown content on first access
        if (node.content === null) {
            try {
                const res = await fetch(`/content/projects/${node.filename}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const md = await res.text();
                node.content = `<div class="article-content">${marked.parse(md)}</div>`;
            } catch (e) {
                addOutput(`cat: ${args[0]}: Failed to load content`, 'error');
                return;
            }
        }
        
        addOutput(node.content);
        
        // Update URL for articles
        if (path.startsWith('/home/projects/')) {
            const urlPath = path.replace('/home/', '');
            history.pushState({ path: currentPath, article: path }, '', '/' + urlPath);
        }
    },
    
    clear: function() {
        document.getElementById('output').innerHTML = '';
    },
    
    help: function() {
        addOutput(`<div class="article-content">
<h2>Available Commands:</h2>
<ul>
  <li><strong>ls [directory]</strong> - list directory contents</li>
  <li><strong>cd [directory]</strong> - change directory</li>
  <li><strong>cat [file]</strong> - display file contents</li>
  <li><strong>clear</strong> - clear the terminal</li>
  <li><strong>help</strong> - show this help message</li>
</ul>
<p>You can also click on directories and files to navigate.</p>
</div>`);
    },
    
    pwd: function() {
        addOutput(currentPath);
    }
};

// Command execution
function executeCommand(input) {
    input = input.trim();
    
    if (!input) {
        return;
    }
    
    addCommand(input);
    commandHistory.push(input);
    historyIndex = commandHistory.length;
    
    const parts = input.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    
    if (commands[cmd]) {
        commands[cmd](args);
    } else {
        addOutput(`${cmd}: command not found. Type 'help' for available commands.`, 'error');
    }
}

// Event listeners
document.getElementById('command-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const input = this.value;
        executeCommand(input);
        this.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            this.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            this.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Basic tab completion could be implemented here
    }
});

// Keep input focused
document.getElementById('terminal').addEventListener('click', function() {
    document.getElementById('command-input').focus();
});

// Handle browser back/forward
window.addEventListener('popstate', function(e) {
    if (e.state && e.state.path) {
        currentPath = e.state.path;
        updatePrompt();
        
        if (e.state.article) {
            const articlePath = e.state.article.replace('/home/', '');
            executeCommand(`cat ${articlePath}`);
        }
    }
});

// Initialize - handle URL routing
function initFromURL() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
        // Home page - show initial ls
        addOutput('<span class="success">Welcome to the personal site of Charles Fredricks</span>');
        addOutput('Type "help" for available commands or "ls" to see what\'s here.\n');
        executeCommand('ls');
        return;
    }
    
    // Parse URL path
    const fullPath = '/home' + (path.startsWith('/') ? path : '/' + path);
    const node = getNode(fullPath);
    
    if (!node) {
        addOutput(`<span class="error">Path not found: ${path}</span>`);
        addOutput('Redirecting to home...\n');
        executeCommand('ls');
        return;
    }
    
    if (node.type === 'directory') {
        currentPath = fullPath;
        updatePrompt();
        executeCommand('ls');
    } else {
        // It's a file - navigate to parent directory and cat the file
        const pathParts = fullPath.split('/').filter(p => p);
        const fileName = pathParts.pop();
        currentPath = '/' + pathParts.join('/');
        updatePrompt();
        executeCommand(`cat ${fileName}`);
    }
}

// Start
loadProjects().then(() => {
    initFromURL();
});
