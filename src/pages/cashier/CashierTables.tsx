import { TablesOverview } from '../../components/TablesOverview';

export const CashierTables = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Zallar xaritasi</h1>
      </div>
      <TablesOverview />
    </div>
  );
};
