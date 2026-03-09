// File system structure for the terminal
export function createFileSystem() {
  return {
    '/home': {
      type: 'directory',
      contents: {
        about: {
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
</div>`,
        },
        contact: {
          type: 'file',
          content: `<h1>Contact Information</h1>
<div class="article-content">
<p>If you must reach out, do so through one of these channels:</p>
<p>Email: <a href="mailto:charles@charlesfredricks.com">charles@charlesfredricks.com</a></p>
<p>GitHub: <a href="https://github.com/papaknee" target="_blank">github.com/papaknee</a></p>
<p>LinkedIn: <a href="https://www.linkedin.com/in/charles-fredricks-80411526" target="_blank">https://www.linkedin.com/in/charles-fredricks-80411526</a></p>
</div>`,
        },
        projects: {
          type: 'directory',
          contents: {},
        },
      },
    },
  };
}

export function resolvePath(currentPath, path) {
  if (path.startsWith('/')) {
    return path;
  }

  const parts = currentPath.split('/').filter((p) => p);
  const newParts = path.split('/').filter((p) => p);

  for (const part of newParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }

  return '/' + parts.join('/');
}

export function getNode(fileSystem, path) {
  if (path === '' || path === '/') {
    return fileSystem;
  }

  if (fileSystem[path]) {
    return fileSystem[path];
  }

  const parts = path.split('/').filter((p) => p);
  let current = fileSystem['/home'];

  if (parts.length === 1 && parts[0] === 'home') {
    return current;
  }

  if (parts[0] === 'home') {
    parts.shift();
  }

  for (const part of parts) {
    if (current.contents && current.contents[part]) {
      current = current.contents[part];
    } else {
      return null;
    }
  }

  return current;
}

export function getProjectArticles(fileSystem) {
  const articles = [];

  function traverse(node, path) {
    if (node.type === 'file' && path.startsWith('/home/projects/')) {
      const pathParts = path.split('/').filter((p) => p);
      if (pathParts.length >= 5) {
        const year = pathParts[2];
        const month = pathParts[3];
        const day = pathParts[4];
        const title = pathParts.slice(5).join('/');
        articles.push({
          path,
          title,
          date: `${year}-${month}-${day}`,
          timestamp: new Date(`${year}-${month}-${day}`).getTime(),
        });
      }
    } else if (node.type === 'directory' && node.contents) {
      for (const key in node.contents) {
        traverse(node.contents[key], path + '/' + key);
      }
    }
  }

  const projectsNode = getNode(fileSystem, '/home/projects');
  if (projectsNode) {
    traverse(projectsNode, '/home/projects');
  }

  articles.sort((a, b) => b.timestamp - a.timestamp);
  return articles;
}

export async function loadProjects(fileSystem) {
  try {
    const res = await fetch('/content/projects/manifest.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const files = await res.json();

    const projectsNode = fileSystem['/home'].contents.projects;

    for (const filename of files) {
      const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
      if (!match) continue;
      const [, year, month, day, slug] = match;

      const c = projectsNode.contents;
      if (!c[year]) c[year] = { type: 'directory', contents: {} };
      if (!c[year].contents[month])
        c[year].contents[month] = { type: 'directory', contents: {} };
      if (!c[year].contents[month].contents[day])
        c[year].contents[month].contents[day] = {
          type: 'directory',
          contents: {},
        };

      c[year].contents[month].contents[day].contents[slug] = {
        type: 'file',
        content: null,
        filename,
      };
    }
  } catch (e) {
    console.error('Failed to load projects manifest:', e);
  }
}
