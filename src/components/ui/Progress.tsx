export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`progress-thin ${className}`}>
      <div className="bar" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
