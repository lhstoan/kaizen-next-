import { type LucideIcon } from "lucide-react";

export default function ComingSoon({ title, icon: Icon, description }: { title: string; icon: LucideIcon; description: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-20 text-center shadow-sm ring-1 ring-black/5">
        <Icon className="size-8 text-neutral-300" />
        <p className="text-sm font-medium text-neutral-600">Coming soon</p>
        <p className="text-sm text-neutral-400">This section isn&apos;t wired up yet.</p>
      </div>
    </div>
  );
}
