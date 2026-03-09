'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import {
  createFileSystem,
  resolvePath,
  getNode,
  getProjectArticles,
  loadProjects,
} from '@/lib/filesystem';

export default function Terminal() {
  const [outputLines, setOutputLines] = useState([]);
  const [currentPath, setCurrentPath] = useState('/home');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [ready, setReady] = useState(false);

  const fileSystemRef = useRef(null);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const currentPathRef = useRef('/home');
  const pendingCommandsRef = useRef([]);

  // Keep path ref in sync
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [outputLines, scrollToBottom]);

  const addOutput = useCallback((html, className = '') => {
    const id = Date.now() + Math.random();
    setOutputLines((prev) => [...prev, { id, html, className }]);
  }, []);

  const addCommand = useCallback(
    (cmd, path) => {
      addOutput(
        `<span class="prompt">guest@charlesfredricks.com:${path}$</span> <span class="command">${cmd}</span>`
      );
    },
    [addOutput]
  );

  // Commands object that uses refs to avoid stale closures
  const executeCommandRef = useRef(null);

  const getCommands = useCallback(() => {
    const fs = fileSystemRef.current;
    if (!fs) return {};

    return {
      ls: (args, path) => {
        const targetPath =
          args.length > 0 ? resolvePath(path, args[0]) : path;
        const node = getNode(fs, targetPath);

        if (!node) {
          addOutput(
            `ls: cannot access '${args.length > 0 ? args[0] : targetPath}': No such file or directory`,
            'error'
          );
          return path;
        }

        if (node.type === 'file') {
          addOutput(targetPath.split('/').pop());
          return path;
        }

        if (!node.contents) {
          return path;
        }

        if (targetPath === '/home/projects') {
          const articles = getProjectArticles(fs);
          if (articles.length === 0) {
            addOutput('No projects found');
            return path;
          }

          articles.forEach((article) => {
            const relativePath = article.path.replace('/home/projects/', '');
            addOutput(
              `<span class="file" data-cmd="cat ${relativePath}">${article.date} - ${article.title}</span>`
            );
          });
          return path;
        }

        const entries = Object.keys(node.contents).sort();
        entries.forEach((entry) => {
          const item = node.contents[entry];
          if (item.type === 'directory') {
            addOutput(
              `<span class="directory" data-cmd="cd ${entry}">${entry}/</span>`
            );
          } else {
            addOutput(
              `<span class="file" data-cmd="cat ${entry}">${entry}</span>`
            );
          }
        });
        return path;
      },

      cd: (args, path) => {
        if (args.length === 0) {
          const newPath = '/home';
          const urlPath = '/';
          window.history.pushState({ path: newPath }, '', urlPath);
          // Auto-ls not needed for /home in cd with no args, but let's keep behavior
          return newPath;
        }

        const newPath = resolvePath(path, args[0]);
        const node = getNode(fs, newPath);

        if (!node) {
          addOutput(`cd: ${args[0]}: No such file or directory`, 'error');
          return path;
        }

        if (node.type !== 'directory') {
          addOutput(`cd: ${args[0]}: Not a directory`, 'error');
          return path;
        }

        const urlPath =
          newPath.replace('/home', '').replace(/^\//, '') || '/';
        window.history.pushState(
          { path: newPath },
          '',
          urlPath === '/' ? '/' : '/' + urlPath
        );

        // Auto-run ls for projects directory
        if (newPath === '/home/projects') {
          pendingCommandsRef.current.push({ cmd: 'ls', args: [], path: newPath });
        }

        return newPath;
      },

      cat: async (args, path) => {
        if (args.length === 0) {
          addOutput('cat: missing file operand', 'error');
          return path;
        }

        const filePath = resolvePath(path, args[0]);
        const node = getNode(fs, filePath);

        if (!node) {
          addOutput(
            `cat: ${args[0]}: No such file or directory`,
            'error'
          );
          return path;
        }

        if (node.type === 'directory') {
          addOutput(`cat: ${args[0]}: Is a directory`, 'error');
          return path;
        }

        // Lazy-load markdown content on first access
        if (node.content === null) {
          try {
            const res = await fetch(
              `/content/projects/${node.filename}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const md = await res.text();
            node.content = `<div class="article-content">${marked.parse(md)}</div>`;
          } catch {
            addOutput(
              `cat: ${args[0]}: Failed to load content`,
              'error'
            );
            return path;
          }
        }

        addOutput(node.content);

        // Update URL for articles
        if (filePath.startsWith('/home/projects/')) {
          const urlPath = filePath.replace('/home/', '');
          window.history.pushState(
            { path, article: filePath },
            '',
            '/' + urlPath
          );
        }

        return path;
      },

      clear: (_args, path) => {
        setOutputLines([]);
        return path;
      },

      help: (_args, path) => {
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
        return path;
      },

      pwd: (_args, path) => {
        addOutput(path);
        return path;
      },
    };
  }, [addOutput]);

  const executeCommand = useCallback(
    async (input, pathOverride) => {
      input = input.trim();
      if (!input) return;

      const path = pathOverride !== undefined ? pathOverride : currentPathRef.current;
      addCommand(input, path);

      setCommandHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);

      const parts = input.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      const cmds = getCommands();
      if (cmds[cmd]) {
        const newPath = await cmds[cmd](args, path);
        if (newPath !== path) {
          currentPathRef.current = newPath;
          setCurrentPath(newPath);
        }

        // Process any pending commands (e.g., auto-ls after cd to projects)
        while (pendingCommandsRef.current.length > 0) {
          const pending = pendingCommandsRef.current.shift();
          addCommand(`${pending.cmd}${pending.args.length ? ' ' + pending.args.join(' ') : ''}`, pending.path);
          const pendingCmds = getCommands();
          if (pendingCmds[pending.cmd]) {
            await pendingCmds[pending.cmd](pending.args, pending.path);
          }
        }
      } else {
        addOutput(
          `${cmd}: command not found. Type 'help' for available commands.`,
          'error'
        );
      }
    },
    [addCommand, addOutput, getCommands]
  );

  executeCommandRef.current = executeCommand;

  // Initialize
  useEffect(() => {
    const fs = createFileSystem();
    fileSystemRef.current = fs;

    loadProjects(fs).then(() => {
      const path = window.location.pathname;

      if (path === '/' || path === '') {
        addOutput(
          '<span class="success">Welcome to the personal site of Charles Fredricks</span>'
        );
        addOutput(
          'Type "help" for available commands or "ls" to see what\'s here.\n'
        );
        // Need to execute ls after state is set
        setTimeout(() => {
          executeCommandRef.current('ls');
        }, 0);
      } else {
        const fullPath = '/home' + (path.startsWith('/') ? path : '/' + path);
        const node = getNode(fs, fullPath);

        if (!node) {
          addOutput(`<span class="error">Path not found: ${path}</span>`);
          addOutput('Redirecting to home...\n');
          setTimeout(() => {
            executeCommandRef.current('ls');
          }, 0);
        } else if (node.type === 'directory') {
          currentPathRef.current = fullPath;
          setCurrentPath(fullPath);
          setTimeout(() => {
            executeCommandRef.current('ls', fullPath);
          }, 0);
        } else {
          const pathParts = fullPath.split('/').filter((p) => p);
          const fileName = pathParts.pop();
          const parentPath = '/' + pathParts.join('/');
          currentPathRef.current = parentPath;
          setCurrentPath(parentPath);
          setTimeout(() => {
            executeCommandRef.current(`cat ${fileName}`, parentPath);
          }, 0);
        }
      }

      setReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handler = (e) => {
      if (e.state && e.state.path) {
        currentPathRef.current = e.state.path;
        setCurrentPath(e.state.path);

        if (e.state.article) {
          const articlePath = e.state.article.replace('/home/', '');
          executeCommandRef.current(`cat ${articlePath}`);
        }
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue);
      setInputValue('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIndex((prev) => {
        const newIndex =
          prev === -1 ? commandHistory.length - 1 : Math.max(0, prev - 1);
        if (newIndex >= 0 && newIndex < commandHistory.length) {
          setInputValue(commandHistory[newIndex]);
        }
        return newIndex;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex((prev) => {
        if (prev === -1) return -1;
        const newIndex = prev + 1;
        if (newIndex >= commandHistory.length) {
          setInputValue('');
          return -1;
        }
        setInputValue(commandHistory[newIndex]);
        return newIndex;
      });
    }
  };

  const handleOutputClick = (e) => {
    // Handle clicks on directory/file spans with data-cmd attributes
    const target = e.target;
    if (target.dataset && target.dataset.cmd) {
      executeCommand(target.dataset.cmd);
    }
    // Always focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!ready) {
    return (
      <div id="terminal" style={{ background: '#1e1e1e', width: '100vw', height: '100vh' }} />
    );
  }

  return (
    <div id="terminal" ref={terminalRef} onClick={handleOutputClick}>
      <div id="output">
        {outputLines.map((line) => (
          <div
            key={line.id}
            className={`output-line${line.className ? ' ' + line.className : ''}`}
            dangerouslySetInnerHTML={{ __html: line.html }}
          />
        ))}
      </div>
      <div id="input-line">
        <span className="prompt">
          guest@charlesfredricks.com:{currentPath}${' '}
        </span>
        <input
          ref={inputRef}
          type="text"
          id="command-input"
          autoFocus
          autoComplete="off"
          spellCheck="false"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
