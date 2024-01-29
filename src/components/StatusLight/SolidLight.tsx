export type SolidLightProps = {
  className: string;
};

function SolidLight({ className }: SolidLightProps) {
  return (
    <svg
      className="align-sub inline"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" className={className} r="6" />
    </svg>
  );
}

export default SolidLight;
