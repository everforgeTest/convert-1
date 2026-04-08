const fs = require('fs');
const path = require('path');

function cleanup() {
  try {
    const files = ['post_exec.sh', 'newContractData.zip'];
    for (const f of files) {
      const p = path.join(process.cwd(), f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    console.log('Cleanup completed.');
  } catch (e) {
    console.log('Cleanup failed:', e.message);
  }
}

cleanup();
