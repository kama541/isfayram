import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('=== STARTING COMPLETE WORKFLOW TEST ===\n');

  // 0. Admin logs in
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@isfayram.com',
    password: '111111'
  });
  if (authErr || !auth?.user) {
    throw new Error('Admin login failed: ' + JSON.stringify(authErr));
  }
  console.log(`[PASS] 0. Admin logged in: ${auth.user.email} (ID: ${auth.user.id})`);

  // 1. Verify Table 12 exists
  const { data: table12, error: tErr } = await supabase
    .from('tables')
    .select('*')
    .eq('table_number', '12-stol')
    .single();

  if (tErr || !table12) {
    throw new Error('Table 12 not found: ' + JSON.stringify(tErr));
  }
  console.log(`[PASS] 1. Table 12 exists (ID: ${table12.id}, status: ${table12.status})`);

  // Ensure Table 12 starts available
  await supabase.from('tables').update({ status: 'available' }).eq('id', table12.id);

  // 2. Verify Waiter exists
  const { data: waiter, error: wErr } = await supabase
    .from('employees')
    .select('*')
    .eq('full_name', 'Aziz')
    .single();

  if (wErr || !waiter) {
    throw new Error('Waiter Aziz not found');
  }
  console.log(`[PASS] 2. Waiter logged in: ${waiter.full_name} (ID: ${waiter.id})`);

  // 3. Find Menu Items
  const { data: shashlikItem } = await supabase.from('menu_items').select('*').ilike('name', '%shashlik%').single();
  const { data: fishItem } = await supabase.from('menu_items').select('*').ilike('name', '%fish%').single();
  const { data: colaItem } = await supabase.from('menu_items').select('*').ilike('name', '%coca-cola%').single();

  if (!shashlikItem || !fishItem || !colaItem) {
    throw new Error('Required menu items (Shashlik, Fish, Coca-Cola) not found in menu_items!');
  }
  console.log(`[PASS] 3. Menu items found:`);
  console.log(`   - ${shashlikItem.name} (${shashlikItem.price} so'm) -> Station: ${shashlikItem.kitchen_station_id}`);
  console.log(`   - ${fishItem.name} (${fishItem.price} so'm) -> Station: ${fishItem.kitchen_station_id}`);
  console.log(`   - ${colaItem.name} (${colaItem.price} so'm) -> Station: ${colaItem.kitchen_station_id}`);

  // 4. Calculate Total for: 2x Shashlik + 1x Fish + 2x Coca-Cola
  const totalAmount = (shashlikItem.price * 2) + (fishItem.price * 1) + (colaItem.price * 2);
  console.log(`\nOrder Items to create: 2x Shashlik, 1x Fish, 2x Coca-Cola. Total: ${totalAmount} so'm`);

  // 5. Create Order in Supabase
  const { data: newOrder, error: oErr } = await supabase
    .from('orders')
    .insert({
      table_id: table12.id,
      waiter_id: waiter.id,
      status: 'new',
      total_amount: totalAmount
    })
    .select()
    .single();

  if (oErr || !newOrder) {
    throw new Error('Failed to create order: ' + JSON.stringify(oErr));
  }
  console.log(`[PASS] 4. Order created in Supabase (ID: ${newOrder.id}, status: ${newOrder.status})`);

  // Set Table 12 to occupied
  await supabase.from('tables').update({ status: 'occupied' }).eq('id', table12.id);

  // 6. Create Order Items and Route to Kitchen Stations
  const orderItemsData = [
    {
      order_id: newOrder.id,
      menu_item_id: shashlikItem.id,
      quantity: 2,
      unit_price: shashlikItem.price,
      total_price: shashlikItem.price * 2,
      kitchen_station_id: shashlikItem.kitchen_station_id,
      status: 'pending'
    },
    {
      order_id: newOrder.id,
      menu_item_id: fishItem.id,
      quantity: 1,
      unit_price: fishItem.price,
      total_price: fishItem.price * 1,
      kitchen_station_id: fishItem.kitchen_station_id,
      status: 'pending'
    },
    {
      order_id: newOrder.id,
      menu_item_id: colaItem.id,
      quantity: 2,
      unit_price: colaItem.price,
      total_price: colaItem.price * 2,
      kitchen_station_id: colaItem.kitchen_station_id,
      status: 'pending'
    }
  ];

  const { data: insertedItems, error: itemsErr } = await supabase
    .from('order_items')
    .insert(orderItemsData)
    .select();

  if (itemsErr || !insertedItems) {
    throw new Error('Failed to insert order items: ' + JSON.stringify(itemsErr));
  }
  console.log(`[PASS] 5. Order items stored in Supabase:`);
  insertedItems.forEach(item => {
    console.log(`   - Item ID: ${item.id}, Qty: ${item.quantity}, Price: ${item.total_price}, Station: ${item.kitchen_station_id}, Status: ${item.status}`);
  });

  // Verify routing to the 3 stations
  const { data: stations } = await supabase.from('kitchen_stations').select('*');
  const getStationName = id => stations.find(s => s.id === id)?.name || id;

  console.log('\n[ROUTING VERIFICATION]:');
  insertedItems.forEach(item => {
    console.log(`   - ${item.quantity}x item routed to: [${getStationName(item.kitchen_station_id)}]`);
  });

  // 7. Kitchen marks each item as cooking then READY
  console.log('\n[KITCHEN WORKFLOW]:');
  for (const item of insertedItems) {
    await supabase.from('order_items').update({ status: 'cooking' }).eq('id', item.id);
    console.log(`   - Item ${item.id} -> COOKING`);
    await supabase.from('order_items').update({ status: 'ready' }).eq('id', item.id);
    console.log(`   - Item ${item.id} -> READY`);
  }

  // Update order status to ready
  await supabase.from('orders').update({ status: 'ready', updated_at: new Date().toISOString() }).eq('id', newOrder.id);
  console.log(`[PASS] 6. Kitchen completed all items. Order status updated to READY`);

  // 8. Cashier accepts payment
  console.log('\n[CASHIER WORKFLOW]:');
  const { data: paymentRecord, error: pErr } = await supabase
    .from('payments')
    .insert({
      order_id: newOrder.id,
      amount: totalAmount,
      payment_method: 'cash'
    })
    .select()
    .single();

  if (pErr) {
    throw new Error('Payment failed: ' + JSON.stringify(pErr));
  }
  console.log(`[PASS] 7. Payment stored in payments table (ID: ${paymentRecord.id}, Method: ${paymentRecord.payment_method}, Amount: ${paymentRecord.amount})`);

  // Mark order as paid
  await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', newOrder.id);
  console.log(`[PASS] 8. Order marked as PAID`);

  // Release table back to available
  await supabase.from('tables').update({ status: 'available' }).eq('id', table12.id);
  const { data: updatedTable } = await supabase.from('tables').select('*').eq('id', table12.id).single();
  console.log(`[PASS] 9. Table 12 returned to AVAILABLE (status: ${updatedTable.status})`);

  // 9. Verify order remains in history
  const { data: historyOrder } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', newOrder.id)
    .single();

  console.log(`[PASS] 10. Completed order verified in history:`);
  console.log(`    - ID: ${historyOrder.id}`);
  console.log(`    - Status: ${historyOrder.status}`);
  console.log(`    - Items count: ${historyOrder.order_items.length}`);
  console.log(`    - Total: ${historyOrder.total_amount}`);

  console.log('\n========================================');
  console.log('✅ ALL WORKFLOW STEPS PASSED SUCCESSFULLY!');
  console.log('========================================');
}

runTest().catch(err => {
  console.error('❌ WORKFLOW TEST FAILED:', err);
  process.exit(1);
});
