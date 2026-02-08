import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;

const targetDir = path.join(__dirname, 'dist');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}

fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccessContent);
console.log('✅ .htaccess created successfully in dist/');