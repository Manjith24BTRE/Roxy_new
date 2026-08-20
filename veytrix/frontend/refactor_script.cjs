const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = '/Users/manjithsingh/Documents/Github/Roxy_new/veytrix/frontend';
const targetDir = path.join(rootDir, 'src', 'components', 'editor-main-screen');

// Ensure target directories exist
const dirsToCreate = [
  targetDir,
  path.join(targetDir, 'tools'),
  path.join(targetDir, 'components'),
  path.join(targetDir, 'theme')
];
dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Move external tools
const externalTools = ['aspect-ratio', 'audio', 'captions', 'effects', 'filters', 'text', 'transitions'];
externalTools.forEach(tool => {
  const src = path.join(rootDir, tool);
  const dest = path.join(targetDir, 'tools', tool);
  if (fs.existsSync(src)) {
    console.log(`Moving ${tool}...`);
    execSync(`mv "${src}" "${dest}"`);
  }
});

// 2. Move internal components
const internalCompsDir = path.join(rootDir, 'src', 'features', 'editor', 'components');
if (fs.existsSync(internalCompsDir)) {
  const comps = fs.readdirSync(internalCompsDir);
  comps.forEach(comp => {
    const src = path.join(internalCompsDir, comp);
    const dest = path.join(targetDir, 'components', comp);
    console.log(`Moving component ${comp}...`);
    execSync(`mv "${src}" "${dest}"`);
  });
}

// 3. Move EditorPage.tsx -> EditorMainScreen.tsx
const oldEditorPage = path.join(rootDir, 'src', 'features', 'editor', 'pages', 'EditorPage.tsx');
const newEditorPage = path.join(targetDir, 'EditorMainScreen.tsx');
if (fs.existsSync(oldEditorPage)) {
  console.log(`Moving EditorPage.tsx...`);
  fs.renameSync(oldEditorPage, newEditorPage);
}

// 4. Update imports using string replacement logic
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const allCodeFiles = getAllFiles(path.join(rootDir, 'src'));
console.log(`Updating imports in ${allCodeFiles.length} files...`);

for (const file of allCodeFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. AppRouter.tsx updates
  if (file.endsWith('AppRouter.tsx')) {
    content = content.replace(
      /import\s+\{\s*EditorPage\s*\}\s+from\s+['"]\.\.\/features\/editor\/pages\/EditorPage\.tsx['"];/,
      "import { EditorMainScreen } from '../components/editor-main-screen/EditorMainScreen.tsx';"
    );
    content = content.replace(/<EditorPage\s*\/>/g, "<EditorMainScreen />");
  }

  // 2. Updates inside EditorMainScreen.tsx
  if (file.endsWith('EditorMainScreen.tsx')) {
    content = content.replace(/export function EditorPage/g, 'export function EditorMainScreen');
    
    // Fix tool imports:
    // Old: import { AspectRatio } from '../../../../aspect-ratio/AspectRatio';
    // New: import { AspectRatio } from './tools/aspect-ratio/AspectRatio';
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/(aspect-ratio|audio|captions|effects|filters|text|transitions)/g, './tools/$1');

    // Fix context menu import:
    // Old: import { TimelineContextMenu } from '../components/Timeline/TimelineContextMenu';
    // New: import { TimelineContextMenu } from './components/Timeline/TimelineContextMenu';
    content = content.replace(/\.\.\/components\/Timeline\/TimelineContextMenu/g, './components/Timeline/TimelineContextMenu');

    // Fix Logo and Context imports
    // Old: import { VeytrixLogo } from '../../../components/VeytrixLogo';
    // New: import { VeytrixLogo } from '../../VeytrixLogo';
    content = content.replace(/\.\.\/\.\.\/\.\.\/components\/VeytrixLogo/g, '../../VeytrixLogo');
    
    // Old: import { useProjectMedia } from '../../../contexts/ProjectMediaContext';
    // New: import { useProjectMedia } from '../../../contexts/ProjectMediaContext'; (Actually it's src/contexts so from src/components/editor-main-screen it is ../../contexts)
    content = content.replace(/\.\.\/\.\.\/\.\.\/contexts\/ProjectMediaContext/g, '../../contexts/ProjectMediaContext');

    // Replace literal theme colors to use semantic CSS variables
    content = content.replace(/bg-white/g, 'bg-surface');
    content = content.replace(/text-slate-950/g, 'text-foreground');
    content = content.replace(/text-gray-900/g, 'text-foreground');
    content = content.replace(/bg-gray-100/g, 'bg-surface-hover');
    content = content.replace(/bg-gray-50/g, 'bg-background');
    content = content.replace(/text-gray-500/g, 'text-muted-foreground');
    content = content.replace(/text-gray-400/g, 'text-muted-foreground');
    content = content.replace(/border-gray-200/g, 'border-border');
    content = content.replace(/border-gray-300/g, 'border-border-strong');
    
    // Add the CSS import to the top of EditorMainScreen.tsx
    if (!content.includes('editorTheme.css')) {
      content = `import './theme/editorTheme.css';\n` + content;
    }
  }

  // 3. Updates inside EditorModules.tsx
  if (file.endsWith('EditorModules.tsx')) {
    // Old: import { AspectRatio } from '../../../../../aspect-ratio/AspectRatio';
    // New: import { AspectRatio } from '../../tools/aspect-ratio/AspectRatio';
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/(aspect-ratio|audio|captions|effects|filters|text|transitions)/g, '../../tools/$1');
  }

  // 4. Updates inside tools (e.g. effects importing transitionSamples)
  // Tool-to-tool imports: since they were all in /frontend/ and now in /src/components/editor-main-screen/tools/, their relative paths to each other don't change!
  // E.g. `import x from '../filters/x'` still works perfectly because both effects and filters moved together.

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
}
console.log('Refactor script complete.');
