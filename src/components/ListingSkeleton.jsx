export default function ListingSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse h-full flex flex-col">
      <div className="aspect-square bg-surfaceHover w-full"></div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-4 bg-surfaceHover rounded-lg w-4/5"></div>
        <div className="h-5 bg-surfaceHover rounded-lg w-1/3"></div>
        <div className="h-3 bg-surfaceHover rounded-lg w-1/2 mt-auto"></div>
      </div>
    </div>
  );
}
