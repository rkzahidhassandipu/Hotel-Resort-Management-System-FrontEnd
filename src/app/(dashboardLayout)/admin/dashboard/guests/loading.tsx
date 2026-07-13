export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded skeleton" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({length:4}).map((_,i) => <div key={i} className="h-28 rounded-xl skeleton" />)}
      </div>
      <div className="h-64 rounded-xl skeleton" />
    </div>
  );
}
