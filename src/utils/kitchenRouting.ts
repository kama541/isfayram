import type { OrderItem, MenuItem, KitchenStation } from '../types';

export const getKitchenStationForOrderItem = (
  item: OrderItem | any,
  menuItems: MenuItem[],
  kitchenStations: KitchenStation[]
): KitchenStation | undefined => {
  const activeStations = (kitchenStations || []).filter(s => s.isActive);
  const menuItem = menuItems.find(m => m.id === (item.menuItemId || item.id));
  
  // 1. First priority: Exact kitchen station ID configured in database
  let stationId = item.kitchenStationId || menuItem?.kitchenStationId;
  if (stationId) {
    const matched = activeStations.find(s => s.id === stationId);
    if (matched) return matched;
  }

  // 2. Second priority: Heuristic name matching across active stations (Shashlik, Fish/Baliq, Tandir, Bar)
  const nameLower = (menuItem?.name || item.name || '').toLowerCase();
  
  // 🔥 Shashlik xonasi
  if (nameLower.includes('shashlik') || nameLower.includes('kabob') || nameLower.includes('jigar') || nameLower.includes('qiyma') || nameLower.includes('mangal') || nameLower.includes('qozon kabob')) {
    const found = activeStations.find(s => s.name.toLowerCase().includes('shashlik') || s.name.toLowerCase().includes('mangal'));
    if (found) return found;
  }
  
  // 🐟 Baliq xonasi
  if (nameLower.includes('baliq') || nameLower.includes('fish') || nameLower.includes('sazan') || nameLower.includes('sudak') || nameLower.includes('forel') || nameLower.includes('som')) {
    const found = activeStations.find(s => s.name.toLowerCase().includes('fish') || s.name.toLowerCase().includes('baliq'));
    if (found) return found;
  }
  
  // 🫓 Tandir xonasi
  if (nameLower.includes('tandir') || nameLower.includes('somsa') || nameLower.includes('non') || nameLower.includes('patir')) {
    const found = activeStations.find(s => s.name.toLowerCase().includes('tandir'));
    if (found) return found;
  }
  
  // 🥤 Bar
  if (nameLower.includes('cola') || nameLower.includes('pepsi') || nameLower.includes('fanta') || nameLower.includes('sprite') || 
      nameLower.includes('choy') || nameLower.includes('kofe') || nameLower.includes('coffee') || nameLower.includes('sok') || 
      nameLower.includes('suv') || nameLower.includes('sharbat') || nameLower.includes('ayron') || nameLower.includes('ichimlik') ||
      nameLower.includes('tort') || nameLower.includes('napalion') || nameLower.includes('medovik') || nameLower.includes('snickers')) {
    const found = activeStations.find(s => s.name.toLowerCase().includes('bar') || s.name.toLowerCase().includes('ichimlik'));
    if (found) return found;
  }

  // 🍲 Asosiy Oshxona
  if (nameLower.includes('osh') || nameLower.includes('shorva') || nameLower.includes('sho\'rva') || 
      nameLower.includes('barmoq') || nameLower.includes('tabaka') || nameLower.includes('salat') || 
      nameLower.includes('svejiy') || nameLower.includes('shakarob') || nameLower.includes('suzma') || 
      nameLower.includes('tuzlama') || nameLower.includes('akroshka')) {
    const found = activeStations.find(s => s.name.toLowerCase().includes('oshxona') || s.name.toLowerCase().includes('kitchen') || s.name.toLowerCase().includes('asosiy'));
    if (found) return found;
  }

  // Fallback: If stationId existed but wasn't active, or no match
  return activeStations.find(s => s.id === stationId);
};
