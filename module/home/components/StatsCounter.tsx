// components/StatsCounter.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Route, HeartHandshake, Trophy } from "lucide-react";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  accent?: boolean;
}

const stats: Stat[] = [
  {
    value: 3500,
    label: "TOTAL PARTICIPANTS",
    suffix: "+",
    icon: <Users size={24} />,
  },
  {
    value: 21.1,
    label: "KILOMETERS",
    suffix: " KM",
    icon: <Route size={24} />,
  },
  {
    value: 200,
    label: "VOLUNTEERS",
    suffix: "+",
    icon: <HeartHandshake size={24} />,
    accent: true,
  },
  {
    value: 50,
    label: "PRIZE POOL ",
    prefix: "৳",
    suffix: "+",
    icon: <Trophy size={24} />,
  },
];

function Counter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDecimal = end % 1 !== 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const eased = 1 - Math.pow(1 - percentage, 4);

      setCount(
        isDecimal
          ? parseFloat((end * eased).toFixed(1))
          : Math.floor(end * eased),
      );

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration, isDecimal]);

  return (
    <h3 ref={ref} className="tracking-wide">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </h3>
  );
}

export default function StatsCounter() {
  return (
    <section id="stats" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            EVENT
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            AT A <br />
            <span className="text-neon-lime">GLANCE</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`border border-gray-200 bg-white p-8 rounded-3xl transition transform hover:scale-[1.03] ${
                stat.accent ? "bg-[#CCFF00]" : ""
              }`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition ${
                  stat.accent
                    ? "bg-black text-[#CCFF00]"
                    : "bg-gray-100 text-black"
                }`}
              >
                {stat.icon}
              </div>

              {/* Counter */}
              <div
                className={`text-4xl md:text-5xl font-bold mb-2 ${
                  stat.accent ? "text-black" : "text-gray-900"
                }`}
              >
                <Counter
                  end={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </div>

              {/* Label */}
              <p
                className={`text-sm uppercase tracking-wider font-medium ${
                  stat.accent ? "text-black/70" : "text-gray-500"
                }`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
