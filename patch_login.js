const fs = require('fs');
let code = fs.readFileSync('src/pages/RootLogin.tsx', 'utf8');

code = code.replace('toast.error("Access Denied. You are not a Root Developer.");', 
`      console.error("Super Admin Check Error:", saError);
      toast.error(saError ? \`DB Error: \${saError.message}\` : "Access Denied. Email not in super_admins table.");`);

fs.writeFileSync('src/pages/RootLogin.tsx', code);
