import { Bolt, Gauge, Star, Trophy } from "lucide-react";
import Link from "next/link";

type Category = {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  bgColor?: string;
  btnBg?: string;
  btnHoverBg?: string;
  btnTextColor?: string;
  btnHoverTextColor?: string;
};

const categories: Category[] = [
  {
    title: "5K DISCOVERY",
    description: "A lively dash for beginners and families.",
    icon: <Bolt size={24} />,
    link: "/login",
    bgColor: "bg-gray-100",
    btnBg: "bg-gray-100",
    btnHoverBg: "hover:bg-black",
    btnTextColor: "text-black",
    btnHoverTextColor: "hover:text-white",
  },
  {
    title: "10K SPEED",
    description: "Test your pace on our certified flat course.",
    icon: <Gauge size={24} />,
    link: "/login",
    bgColor: "bg-gray-100",
    btnBg: "bg-gray-100",
    btnHoverBg: "hover:bg-black",
    btnTextColor: "text-black",
    btnHoverTextColor: "hover:text-white",
  },
  {
    title: "HALF MARATHON",
    description: "The definitive test of strength and endurance.",
    icon: <Star size={24} />,
    link: "/login",
    bgColor: "bg-[#CCFF00]",
    btnBg: "bg-black",
    btnHoverBg: "hover:bg-[#CCFF00]",
    btnTextColor: "text-white",
    btnHoverTextColor: "hover:text-black",
  },
  {
    title: "FULL MARATHON",
    description: "The ultimate achievement for elite athletes.",
    icon: <Trophy size={24} />,
    link: "/login",
    bgColor: "bg-gray-100",
    btnBg: "bg-gray-100",
    btnHoverBg: "hover:bg-black",
    btnTextColor: "text-black",
    btnHoverTextColor: "hover:text-white",
  },
];

export default function Categories() {
  return (
    <section id="categories" className="py-24 px-4 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            CHOOSE
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            YOUR <br />
            <span className="text-lime-400">DISTANCE</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div
              key={i}
              className={`border border-gray-200 bg-white p-8 rounded-3xl category-card transition transform hover:scale-[1.03]`}
            >
              <div
                className={`w-14 h-14 ${cat.bgColor} rounded-2xl flex items-center justify-center mb-6 category-icon transition`}
              >
                {cat.icon}
              </div>

              <h3 className="text-2xl font-bold mb-2">{cat.title}</h3>
              <p className="text-gray-500 text-sm mb-6">{cat.description}</p>

              <Link
                href={cat.link}
                className={`block text-center py-3 rounded-full text-sm font-bold ${cat.btnBg} ${cat.btnTextColor} ${cat.btnHoverBg} ${cat.btnHoverTextColor} transition`}
              >
                JOIN {cat.title.split(" ")[0]}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
