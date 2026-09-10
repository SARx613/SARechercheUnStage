import NetworkingTable from "@/components/NetworkingTable";
import Link from "next/link";

export default function NetworkingPage() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
          <h1 className="text-base font-semibold text-[#131a28]">
            Networking
          </h1>
        </div>
        <Link href="/" className="text-sm text-[#367afd] hover:underline">
          ← Offres de stage
        </Link>
      </header>
      <NetworkingTable />
    </div>
  );
}
