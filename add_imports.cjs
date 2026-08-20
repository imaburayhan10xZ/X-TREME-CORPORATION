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
  if (!content.includes('import { useSettings }')) {
    content = 'import { useSettings } from "@/contexts/SettingsContext";\nimport { getCurrencySymbol } from "@/lib/utils";\n' + content;
    fs.writeFileSync(file, content);
  }
});
console.log('Done');
