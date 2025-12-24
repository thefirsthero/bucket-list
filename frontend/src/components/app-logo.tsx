import { appConfig } from "@/config/app";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/bucket-list.svg" alt="Bucket List" className="size-7" />
      <span className="font-semibold text-nowrap">{appConfig.name}</span>
    </div>
  );
}
