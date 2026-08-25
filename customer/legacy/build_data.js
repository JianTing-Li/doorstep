const { execSync } = require('child_process');
const fs = require('fs');

function getGitFile(path) {
    return execSync(`git show origin/feature/mock-data:mock-data/${path}`).toString();
}

const listings = getGitFile('listings.json');
const providers = getGitFile('providers.json');
const serviceTypes = getGitFile('service-types.json');

const content = `// Auto-generated from origin/feature/mock-data
const DB_LISTINGS = ${listings};
const DB_PROVIDERS = ${providers};
const DB_SERVICE_TYPES = ${serviceTypes};
`;

fs.writeFileSync('data.js', content);
console.log('Successfully created data.js');
