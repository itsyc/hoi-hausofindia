const fs = require('fs')
const path = require('path')

function chmodRecursive(targetPath) {
  try {
    if (!fs.existsSync(targetPath)) return
    const stat = fs.statSync(targetPath)
    
    if (stat.isDirectory()) {
      try { fs.chmodSync(targetPath, 0o755) } catch (e) {}
      const items = fs.readdirSync(targetPath)
      items.forEach(item => chmodRecursive(path.join(targetPath, item)))
    } else {
      try { fs.chmodSync(targetPath, 0o644) } catch (e) {}
    }
  } catch (err) {
    // Ignore permission errors if already restricted by OS
  }
}

console.log('Fixing directory and file permissions (0755/0644)...')
const targetDirectories = ['src', 'public', 'prisma', 'scripts']
targetDirectories.forEach(dir => {
  chmodRecursive(path.resolve(__dirname, '..', dir))
})
console.log('Permissions updated successfully.')
