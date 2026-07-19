import JobsTable from "@/components/JobsTable";
import PushToggle from "@/components/PushToggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
          <h1 className="text-base font-semibold text-[#131a28]">
            Stage Tracker
          </h1>
        </div>
        <PushToggle />
      </header>
      <JobsTable />
    </div>
  );
}
