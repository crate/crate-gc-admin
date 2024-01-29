export type VerticalProgressProps = {
  max: number;
  current: number;
};

function VerticalProgress({ max, current }: VerticalProgressProps) {
  const normalized = Math.floor((current / max) * 10);
  const missing = normalized < 10 ? new Array(10 - normalized).fill('') : [''];
  const filled = new Array(normalized).fill('');
  return (
    <div className="h-full">
      {missing.map(() => {
        return <div className="w-full bg-gray-300 h-[4px] mb-0.5"></div>;
      })}
      {filled.map(() => {
        return <div className="w-full bg-crate-blue h-[4px] mb-0.5"></div>;
      })}
    </div>
  );
}

export default VerticalProgress;
