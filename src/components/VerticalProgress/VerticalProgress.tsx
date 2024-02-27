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
        return <div className="mb-0.5 h-[4px] w-full bg-gray-300"></div>;
      })}
      {filled.map(() => {
        return <div className="mb-0.5 h-[4px] w-full bg-crate-blue"></div>;
      })}
    </div>
  );
}

export default VerticalProgress;
