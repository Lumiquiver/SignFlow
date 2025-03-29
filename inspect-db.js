/**
 * Simple database inspection script
 * Run with: node inspect-db.js
 */

import pg from 'pg';
const { Client } = pg;

// Get database connection from environment
const connectionString = process.env.DATABASE_URL;

async function main() {
  // Create a new client
  const client = new Client({ connectionString });
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database successfully!');
    
    // Check if gestures table exists
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('\nTables in the database:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // If gestures table exists, query it
    if (tablesResult.rows.some(row => row.table_name === 'gestures')) {
      const gesturesQuery = `
        SELECT * FROM gestures LIMIT 10;
      `;
      
      const gesturesResult = await client.query(gesturesQuery);
      console.log('\nSample gestures data:');
      
      if (gesturesResult.rows.length > 0) {
        // Print the first gesture
        console.log('First gesture:');
        console.log(JSON.stringify(gesturesResult.rows[0], null, 2));
        
        // Count by type
        const typeCountQuery = `
          SELECT type, COUNT(*) as count
          FROM gestures
          GROUP BY type
          ORDER BY count DESC;
        `;
        
        const typeResult = await client.query(typeCountQuery);
        console.log('\nGesture counts by type:');
        typeResult.rows.forEach(row => {
          console.log(`- ${row.type}: ${row.count}`);
        });
        
        // Get gesture with ID 1 for testing purposes
        const specificGestureQuery = `
          SELECT * FROM gestures WHERE id = 1;
        `;
        
        const specificResult = await client.query(specificGestureQuery);
        if (specificResult.rows.length > 0) {
          const gesture = specificResult.rows[0];
          console.log('\nGesture with ID 1:');
          console.log(JSON.stringify(gesture, null, 2));
          
          // Update the description
          const updateQuery = `
            UPDATE gestures 
            SET description = $1, complexity = $2
            WHERE id = 1
            RETURNING *;
          `;
          
          const newDescription = `Updated via direct SQL - ${new Date().toISOString()}`;
          const newComplexity = Math.min(5, (gesture.complexity || 1) + 1);
          
          console.log(`\nUpdating gesture ID 1 with new description and complexity ${newComplexity}...`);
          
          const updateResult = await client.query(updateQuery, [newDescription, newComplexity]);
          console.log('Update result:');
          console.log(JSON.stringify(updateResult.rows[0], null, 2));
        } else {
          console.log('\nGesture with ID 1 not found.');
        }
      } else {
        console.log('No gestures found in the database.');
      }
    } else {
      console.log('Gestures table not found in the database.');
    }
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the main function
main();