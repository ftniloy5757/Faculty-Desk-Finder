"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MapView from "@/components/MapView";

function DeskPageContent({
  params,
}: {
  params: Promise<{ deskId: string }>;
}) {
  const { deskId } = use(params);
  const searchParams = useSearchParams();
  const initial = searchParams.get("initial") || undefined;

  return <MapView autoSelectDeskId={deskId} autoSelectInitial={initial} />;
}

export default function DeskPage({
  params,
}: {
  params: Promise<{ deskId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <DeskPageContent params={params} />
    </Suspense>
  );
}
