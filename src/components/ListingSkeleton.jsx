export default function ListingSkeleton({ featured = false }) {
  return (
    <div className={`bg-card rounded-3xl overflow-hidden h-full flex flex-col ${featured ? '' : ''}`}>
      <div className={`bg-pill/20 w-full animate-pulse-soft ${featured ? 'aspect-[4/5]' : 'aspect-square'}`} />
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        <div className="h-6 bg-pill/20 rounded-lg w-2/5 animate-pulse-soft" />
        <div className="h-3.5 bg-pill/20 rounded-md w-4/5 animate-pulse-soft" />
        <div className="h-3 bg-pill/20 rounded-md w-1/2 mt-auto animate-pulse-soft" />
      </div>
    </div>
  );
}
