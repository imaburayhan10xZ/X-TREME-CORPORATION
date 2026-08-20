const fs = require('fs');

const file = 'src/pages/PaymentAlerts.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useSettings')) {
  content = 'import { useSettings } from "@/contexts/SettingsContext";\nimport { getCurrencySymbol } from "@/lib/utils";\n' + content;
}

if (!content.match(/const\s*{\s*settings\s*}\s*=\s*useSettings\(\)/)) {
  const lines = content.split('\n');
  const stateLineIndex = lines.findIndex(line => line.includes('useState(true)'));
  if (stateLineIndex !== -1) {
    lines.splice(stateLineIndex, 0, '  const { settings } = useSettings();\n  const currencySymbol = getCurrencySymbol(settings.currency);');
    content = lines.join('\n');
  }
}

content = content.replace(/\$([0-9]+)/g, '{currencySymbol}$1');
content = content.replace(/\$\{([^}]+)\}/g, '{currencySymbol}{$1}');
content = content.replace(/>\$\{/g, '>{currencySymbol}{');

fs.writeFileSync(file, content);
console.log('Done');
