const SUPABASE_URL = "https://dmccbojtmvdazfdnyduh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA";

async function run() {
  // delete all tables first
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/tables?id=not.is.null`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    }
  });

  if (!delRes.ok) {
    const text = await delRes.text();
    console.error("Failed to delete old tables:", delRes.status, text);
  } else {
    console.log("Deleted old tables.");
  }

  const tablesToInsert = [];
  
  for(let i=1; i<=9; i++) {
    tablesToInsert.push({
      table_number: `${i}-kabinet`,
      status: 'available',
      capacity: 4
    });
  }

  for(let i=1; i<=15; i++) {
    tablesToInsert.push({
      table_number: `${i}-stol`,
      status: 'available',
      capacity: 4
    });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/tables`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(tablesToInsert)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to seed tables:", res.status, text);
  } else {
    console.log("Successfully inserted 24 tables.");
  }
}

run();
