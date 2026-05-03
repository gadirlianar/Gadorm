export default function ListingSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-border animate-pulse h-full flex flex-col">
      <div className="aspect-square bg-surfaceHover w-full"></div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-6 bg-surfaceHover rounded-md w-3/4"></div>
        <div className="h-5 bg-surfaceHover rounded-md w-1/2"></div>
        <div className="h-4 bg-surfaceHover rounded-md w-1/3 mt-auto"></div>
      </div>
    </div>
  );
}
