import { Calendar, Clock, MapPin } from "lucide-react";

interface HeroTextProps {
  title: string;
  date?: string;
  time?: string;
  location?: string;
}

export const HeroText = ({ title, date, time, location }: HeroTextProps) => {
  return (
    <section className="relative mx-auto w-full max-w-7xl text-center items-center px-4 ">
      {/* Title  */}
      <div className="relative mb-6 inline-block">
        <h1 className="text-5xl font-black leading-none tracking-wide uppercase sm:text-6xl md:text-7xl lg:text-8xl max-w-2xl">
          {title}
        </h1>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
        {date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
              {date}
            </span>
          </div>
        )}

        {time && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
              {time}
            </span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
              {location}
            </span>
          </div>
        )}

        {/* <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
            9:31 PM – 12:31 AM
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
            Adelaide, South Australia
          </span>
        </div> */}
      </div>

      <div className="border-gray-200 mx-auto mt-24 w-full border-t"></div>
    </section>
  );
};
