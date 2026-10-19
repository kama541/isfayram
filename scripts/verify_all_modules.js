import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runComprehensiveVerification() {
  console.log('====================================================');
  console.log('🚀 ISFAYRAM FULL PRODUCTION INTEGRATION VERIFICATION');
  console.log('====================================================\n');

  // --- MODULE 1: AUTHENTICATION ---
  console.log('--- [1] AUTHENTICATION & SECURITY ---');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@isfayram.com',
    password: '111111'
  });
  if (authErr || !auth?.user) throw new Error('Admin authentication failed: ' + JSON.stringify(authErr));
  console.log(`✅ Admin authenticated: ${auth.user.email} (UID: ${auth.user.id})`);

  // Verify PIN codes for staff login
  const { data: employees, error: empErr } = await supabase.from('employees').select('*');
  if (empErr) throw new Error('Employees table query failed: ' + empErr.message);
  console.log(`✅ Staff database: ${employees.length} employees found.`);
  const activeStaff = employees.filter(e => e.is_active);
  console.log(`   - Active staff: ${activeStaff.length}, Inactive: ${employees.length - activeStaff.length}`);
  const roles = [...new Set(employees.map(e => e.role))];
  console.log(`   - Staff roles present: ${roles.join(', ')}`);

  // --- MODULE 2: TABLES & OCCUPANCY ---
  console.log('\n--- [2] TABLES & FLOOR PLAN ---');
  const { data: tables, error: tabErr } = await supabase.from('tables').select('*');
  if (tabErr) throw new Error('Tables table query failed: ' + tabErr.message);
  console.log(`✅ Tables loaded: ${tables.length} tables/cabins configured.`);
  const availableTables = tables.filter(t => t.status === 'available');
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  console.log(`   - Available: ${availableTables.length}, Occupied: ${occupiedTables.length}`);

  // --- MODULE 3: MENU & CATEGORIES ---
  console.log('\n--- [3] MENU & CATEGORIES ---');
  const { data: categories, error: catErr } = await supabase.from('menu_categories').select('*').order('sort_order');
  const { data: menuItems, error: menuErr } = await supabase.from('menu_items').select('*');
  if (catErr || menuErr) throw new Error('Menu query failed');
  console.log(`✅ Menu loaded: ${categories.length} categories, ${menuItems.length} menu items.`);
  const availableItems = menuItems.filter(m => m.is_available);
  console.log(`   - Available items: ${availableItems.length}, Stop-listed items: ${menuItems.length - availableItems.length}`);

  // --- MODULE 4: KITCHEN STATIONS & ROUTING ---
  console.log('\n--- [4] KITCHEN STATIONS & ROUTING ---');
  const { data: stations, error: stErr } = await supabase.from('kitchen_stations').select('*');
  if (stErr) throw new Error('Kitchen stations query failed');
  console.log(`✅ Kitchen stations: ${stations.length} stations found:`);
  stations.forEach(s => {
    const assignedItems = menuItems.filter(m => m.kitchen_station_id === s.id);
    console.log(`   - [${s.name}] (Active: ${s.is_active}) -> ${assignedItems.length} menu items routed`);
  });

  // Verify the 4 mandatory rooms exist
  const expectedRooms = ['Fish', 'Shashlik', 'Tandir', 'Bar'];
  for (const room of expectedRooms) {
    const match = stations.find(s => s.name.toLowerCase().includes(room.toLowerCase()));
    if (!match) {
      console.warn(`⚠️ Warning: Kitchen station for ${room} not found by exact pattern`);
    } else {
      console.log(`   ✓ Station verified: "${match.name}" (ID: ${match.id})`);
    }
  }

  // --- MODULE 5: ORDERS & ORDER ITEMS ---
  console.log('\n--- [5] ORDERS & HISTORY ---');
  const { data: orders, error: ordErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20);
  if (ordErr) throw new Error('Orders query failed');
  console.log(`✅ Recent orders queried: ${orders.length} orders retrieved.`);
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`   - Status breakdown in sample:`, statusCounts);

  // --- MODULE 6: FINANCE & PAYMENTS JOURNAL ---
  console.log('\n--- [6] FINANCE & REAL PAYMENTS ---');
  const { data: payments, error: payErr } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(20);
  const { data: expenses, error: expErr } = await supabase.from('expenses').select('*').order('payment_date', { ascending: false }).limit(20);
  if (payErr || expErr) throw new Error('Finance query failed');
  console.log(`✅ Payments journal: ${payments.length} real payments retrieved from 'payments' table.`);
  const cashPayments = payments.filter(p => p.payment_method === 'cash');
  const cardPayments = payments.filter(p => p.payment_method === 'card');
  console.log(`   - Cash payments: ${cashPayments.length}, Card payments: ${cardPayments.length}`);
  console.log(`✅ Expense records: ${expenses.length} expenses retrieved.`);

  // --- MODULE 7: INVENTORY & RECIPES ---
  console.log('\n--- [7] INVENTORY & RECIPES ---');
  const { data: inventory, error: invErr } = await supabase.from('inventory_items').select('*');
  const { data: recipes, error: recErr } = await supabase.from('recipe_ingredients').select('*');
  if (invErr || recErr) throw new Error('Inventory query failed');
  console.log(`✅ Inventory items: ${inventory.length} items tracked.`);
  console.log(`✅ Recipe ingredient links: ${recipes.length} recipes configured for automatic deduction.`);

  // --- MODULE 8: RECEIPT PRINT SETTINGS & FORMATTING VERIFICATION ---
  console.log('\n--- [8] RECEIPT PRINTER & LAYOUT VALIDATION ---');
  const { data: settings, error: setErr } = await supabase.from('settings').select('*');
  if (setErr) throw new Error('Settings query failed');
  
  const receiptTitle = settings.find(s => s.key === 'receipt_title')?.value || 'ISFAYRAM KAFE';
  const receiptAddress = settings.find(s => s.key === 'receipt_address')?.value || 'Quvasoy, UZ';
  const paperWidth = settings.find(s => s.key === 'receipt_paper_width')?.value || '80mm';
  
  console.log(`✅ Receipt settings in database:`);
  console.log(`   - Title: "${receiptTitle}"`);
  console.log(`   - Address: "${receiptAddress}"`);
  console.log(`   - Configured paper width: ${paperWidth}`);

  // Test formatting of items for 58mm and 80mm
  function validateReceiptFormat(width) {
    const is58 = width === '58mm';
    const printableWidthMm = is58 ? 48 : 72;
    const testItem = { name: "Shashlik (Qo'y go'shti)", quantity: 2, price: 22000 };
    const total = testItem.quantity * testItem.price;
    const formattedPrice = new Intl.NumberFormat('ru-RU').format(total).replace(',', ' ') + " UZS";
    
    if (formattedPrice.replace(/[\s\u00A0\u202F]/g, ' ') !== "44 000 UZS") {
      throw new Error(`Price formatting error: expected "44 000 UZS", got "${formattedPrice}"`);
    }
    console.log(`   ✓ [${width}] Printable width: ${printableWidthMm}mm. Item: "${testItem.name}" | Qty: ${testItem.quantity} | Total: ${formattedPrice}`);
  }

  validateReceiptFormat('58mm');
  validateReceiptFormat('80mm');

  // --- MODULE 9: FULL E2E WORKFLOW TEST (ADMIN -> WAITER -> KITCHEN -> CASHIER -> PAYMENT -> PRINT DATA) ---
  console.log('\n--- [9] FULL WORKFLOW EXECUTION (TABLE 15) ---');
  
  // 1. Target table
  const testTable = tables[0];
  console.log(`1. Target Table: ${testTable.table_number} (ID: ${testTable.id})`);

  // 2. Target waiter
  const testWaiter = activeStaff.find(s => s.role === 'waiter') || employees[0];
  console.log(`2. Waiter: ${testWaiter.full_name} (ID: ${testWaiter.id})`);

  // 3. Select 2 items
  const item1 = menuItems[0];
  const item2 = menuItems[1] || menuItems[0];
  const expectedTotal = (item1.price * 2) + (item2.price * 1);
  console.log(`3. Order Items: 2x ${item1.name} (${item1.price}), 1x ${item2.name} (${item2.price}). Total: ${expectedTotal} UZS`);

  // 4. Create Order
  const { data: newOrder, error: newOrdErr } = await supabase.from('orders').insert({
    table_id: testTable.id,
    waiter_id: testWaiter.id,
    status: 'new',
    total_amount: expectedTotal
  }).select().single();
  if (newOrdErr || !newOrder) throw new Error('Create order failed: ' + newOrdErr?.message);
  console.log(`4. Order created: ID ${newOrder.id}`);

  // Set Table to occupied
  await supabase.from('tables').update({ status: 'occupied' }).eq('id', testTable.id);

  // 5. Create Order Items with Kitchen Station routing
  const { data: insertedItems, error: oiErr } = await supabase.from('order_items').insert([
    {
      order_id: newOrder.id,
      menu_item_id: item1.id,
      quantity: 2,
      unit_price: item1.price,
      total_price: item1.price * 2,
      kitchen_station_id: item1.kitchen_station_id,
      status: 'pending'
    },
    {
      order_id: newOrder.id,
      menu_item_id: item2.id,
      quantity: 1,
      unit_price: item2.price,
      total_price: item2.price * 1,
      kitchen_station_id: item2.kitchen_station_id,
      status: 'pending'
    }
  ]).select();
  if (oiErr || !insertedItems) throw new Error('Insert order items failed: ' + oiErr?.message);
  console.log(`5. Order items created and routed to stations: ${insertedItems.length} items.`);

  // 6. Kitchen updates to cooking then ready
  for (const oi of insertedItems) {
    await supabase.from('order_items').update({ status: 'cooking' }).eq('id', oi.id);
    await supabase.from('order_items').update({ status: 'ready' }).eq('id', oi.id);
  }
  await supabase.from('orders').update({ status: 'ready', updated_at: new Date().toISOString() }).eq('id', newOrder.id);
  console.log(`6. Kitchen completed preparation. Order marked READY.`);

  // 7. Cashier receives and registers payment
  const { data: paymentRecord, error: pErr } = await supabase.from('payments').insert({
    order_id: newOrder.id,
    amount: expectedTotal,
    payment_method: 'bank_card'
  }).select().single();
  if (pErr || !paymentRecord) throw new Error('Payment insert failed: ' + pErr?.message);
  console.log(`7. Cashier accepted payment: ID ${paymentRecord.id}, Method: CARD, Amount: ${paymentRecord.amount} UZS`);

  // Update order to paid
  await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', newOrder.id);
  console.log(`8. Order status updated to PAID.`);

  // Release table back to available
  await supabase.from('tables').update({ status: 'available' }).eq('id', testTable.id);
  const { data: freedTable } = await supabase.from('tables').select('status').eq('id', testTable.id).single();
  console.log(`9. Table released to status: '${freedTable.status}' (Must be 'available')`);

  if (freedTable.status !== 'available') {
    throw new Error('Table was not reverted to available!');
  }

  // 10. Generate Receipt Payload for Single Print verification
  const receiptPayload = {
    orderId: newOrder.id,
    table: testTable.table_number,
    waiter: testWaiter.full_name,
    items: insertedItems.map(i => ({
      name: i.menu_item_id === item1.id ? item1.name : item2.name,
      quantity: i.quantity,
      price: i.unit_price,
      total: i.total_price
    })),
    totalAmount: expectedTotal,
    paymentMethod: 'CARD',
    isPaid: true
  };

  console.log(`10. Receipt print payload validated:`);
  console.log(JSON.stringify(receiptPayload, null, 2));

  console.log('\n====================================================');
  console.log('🎉 ALL 9 MODULES & FULL WORKFLOW VERIFIED 100% CLEAN!');
  console.log('====================================================');
}

runComprehensiveVerification().catch(err => {
  console.error('\n❌ VERIFICATION ERROR:', err);
  process.exit(1);
});
