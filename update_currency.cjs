const fs = require('fs');

const pages = [
  'src/pages/Dashboard.tsx',
  'src/pages/Packages.tsx',
  'src/pages/Payments.tsx',
  'src/pages/Renewals.tsx',
  'src/pages/OBBFees.tsx',
  'src/pages/Reports.tsx',
  'src/pages/Users.tsx'
];

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { useSettings } from "@/contexts/SettingsContext"')) {
    content = content.replace('import Layout from', 'import { useSettings } from "@/contexts/SettingsContext";\nimport { getCurrencySymbol } from "@/lib/utils";\nimport Layout from');
  }
  
  if (!content.match(/const\s*{\s*settings\s*}\s*=\s*useSettings\(\)/)) {
     // match a useState line to insert it before
     const lines = content.split('\n');
     const stateLineIndex = lines.findIndex(line => line.includes('useState(true);') || line.includes('useState(false);') || line.includes('useState<any[]>([])') || line.includes('useState('));
     if (stateLineIndex !== -1 && lines[stateLineIndex].includes('useState')) {
        lines.splice(stateLineIndex, 0, '  const { settings } = useSettings();\n  const currencySymbol = getCurrencySymbol(settings.currency);');
        content = lines.join('\n');
     }
  }
  
  // Replace \$ with {currencySymbol} where appropriate
  // like >$ or > $ or {`$
  
  content = content.replace(/>\$([0-9]+)/g, '>{currencySymbol}$1');
  content = content.replace(/>\$\{([^}]+)\}/g, '>{currencySymbol}{$1}');
  
  // `$${val}` -> `${currencySymbol}${val}`
  content = content.replace(/`\$([^`]+)`/g, '`${currencySymbol}$1`');
  
  // ($) in labels
  content = content.replace(/\(\$\)/g, '({currencySymbol})');
  
  fs.writeFileSync(file, content);
});
console.log('Done');
