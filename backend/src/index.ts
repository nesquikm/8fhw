import 'dotenv/config';
import { createApp } from './app.js';
import { createDatabase } from './db/sqlite.js';

// Fail fast if required AI env vars are missing
if (!process.env.AI_API_URL) {
  console.error('FATAL: AI_API_URL environment variable is required');
  process.exit(1);
}
if (!process.env.AI_API_KEY) {
  console.error('FATAL: AI_API_KEY environment variable is required');
  process.exit(1);
}

const db = createDatabase();
const app = createApp({ db });
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
