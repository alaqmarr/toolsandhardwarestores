const fs = require('fs');
const path = require('path');
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}
const files = getFiles('app/api/admin').filter(f => !f.includes('login') && !f.includes('logout'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let originalContent = content;
  
  if (!content.includes('revalidatePath')) {
    content = "import { revalidatePath } from 'next/cache';\n" + content;
  }
  
  content = content.replace(/(revalidatePath\('\/',\s*'layout'\);\s*)?(return\s+NextResponse\.json\(\s*\{[\s\S]*?success:\s*true)/g, (match, p1, p2) => {
    if (p1) return match; // already has it
    return "revalidatePath('/', 'layout');\n    " + p2;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated', f);
  }
});
