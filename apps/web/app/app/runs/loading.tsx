import { Skeleton } from "../../../components/ui/skeleton";

export default function RunsLoading() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-14" />
      <Skeleton className="h-96" />
    </>
  );
}
