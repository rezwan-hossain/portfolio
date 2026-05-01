// const sponsors = [
//   "RiseX Limited",
//   // "T-Sports",
//   // "SQUARE PHARMA",
//   // "ROBI AXIATA",
//   // "PRAN GROUP",
//   // "DUTCH-BANGLA BANK",
//   // "BASHUNDHARA",
//   // "TRANSCOM",
// ];

import Image from "next/image";

const sponsors = [
  {
    name: "RiseX Limited",
    logo: "https://res.cloudinary.com/ddea6u6xh/image/upload/v1777657921/thumb_65a43e21ef5f4170526262_p5fqqm.png",
  },
  {
    name: "T-Sports",
    logo: "https://res.cloudinary.com/ddea6u6xh/image/upload/v1777657921/1775322618367-cwcidx_b0ypvj.png",
  },
];
export default function Sponsors() {
  return (
    <section id="sponsors" className=" bg-white px-[5%] py-20 ">
      <div className="text-center mb-12">
        <div className="text-sm uppercase tracking-widest text-gray-500">
          Our
        </div>

        <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
          Proud <br />
          <span className="text-neon-lime">Partners</span>
        </h2>
      </div>

      <div className="relative overflow-hidden mt-12">
        {/* gradient edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex w-max gap-10 animate-sponsor-scroll">
          {[...sponsors, ...sponsors].map((sponsor, i) => (
            <div
              key={i}
              className="min-w-[180px] whitespace-nowrap border border-gray-200 px-10 py-6 text-center text-xl tracking-[3px] text-gray-400 transition hover:border-gray-400 hover:text-gray-800 rounded-sm"
            >
              {/* {sponsor} */}
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={200}
                height={100}
                className="h-12 object-contain w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
