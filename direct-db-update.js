// Using ES modules (because package.json has "type": "module")
import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Database connected! Testing direct update...');
    
    // Test a direct update to gesture with ID 1
    const updateQuery = `
      UPDATE gestures
      SET description = $1, has_motion = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *;
    `;
    
    const description = `Direct update test - ${new Date().toISOString()}`;
    const hasMotion = true;
    
    console.log(`Updating gesture with description: ${description} and hasMotion: ${hasMotion}`);
    
    const result = await client.query(updateQuery, [description, hasMotion]);
    
    if (result.rowCount > 0) {
      console.log('Update successful!');
      console.log('Updated gesture:', result.rows[0]);
      
      // Verify the update
      const verifyQuery = `SELECT * FROM gestures WHERE id = 1;`;
      const verifyResult = await client.query(verifyQuery);
      
      console.log('\nVerification query result:');
      console.log(verifyResult.rows[0]);
    } else {
      console.log('Update failed - no rows affected');
    }
    
    console.log('\nReleasing database connection...');
    client.release();
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
}

main();