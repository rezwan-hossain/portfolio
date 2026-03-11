type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
};

const schedule: ScheduleItem[] = [
  {
    time: "05:00",
    title: "ASSEMBLY & WARMUP",
    location: "Hatirjheel Main Entrance",
  },
  {
    time: "06:00",
    title: "MARATHON FLAG-OFF",
    location: "Professional Wave",
  },
  {
    time: "10:30",
    title: "MEDAL PRESENTATION",
    location: "Main Podium Stage",
  },
];

export default function EventSchedule() {
  return (
    <section id="schedule" className=" px-[5%] py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            EVENT
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            DAY <br />
            <span className="text-neon-lime">SCHEDULE</span>
          </h2>
        </div>

        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-6 border-b border-gray-100 hover:bg-gray-50 transition rounded-xl"
            >
              <div className="flex items-center gap-6">
                <span className="text-2xl font-bold text-neon-lime">
                  {item.time}
                </span>

                <span className="font-bold text-lg">{item.title}</span>
              </div>

              {item.location && (
                <span className="text-gray-400 text-sm hidden md:block">
                  {item.location}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
