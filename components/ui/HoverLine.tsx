'use client'

import { useRef } from "react";

const HoverLine = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    ref.current!.style.setProperty("--mouse-x", `${x}%`);
    ref.current!.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[2px] mt-6 mb-6 overflow-hidden bg-gray-200"
      style={{
        background: `radial-gradient(circle 100px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.25), transparent 80%)`,
        transition: "background-position 0.05s linear",
      }}
    />
  );
};

export default HoverLine;