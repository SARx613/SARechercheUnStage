import JobsTable from "@/components/JobsTable";
import PushToggle from "@/components/PushToggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-100">Stage Tracker</h1>
        <PushToggle />
      </header>
      <JobsTable />
    </div>
  );
}
