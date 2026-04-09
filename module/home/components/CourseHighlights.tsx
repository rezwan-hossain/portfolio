// components/CourseHighlights.tsx
import Image from "next/image";
import {
  MapPin,
  Building2,
  Waves,
  Trophy,
  Palmtree,
  Landmark,
} from "lucide-react";

const highlights = [
  {
    icon: MapPin,
    title: "Starting Point",
    description: "Hatirjheel Amphitheatre, Tejgaon",
    image: "/images/hatirjheel-start.jpg",
    distance: "Km 0",
  },
  {
    icon: Building2,
    title: "Gulshan Circle",
    description: "Through Diplomatic Zone",
    image: "/images/gulshan-circle.jpg",
    distance: "Km 8",
  },
  {
    icon: Waves,
    title: "Hatirjheel Lake",
    description: "Scenic Waterfront Promenade",
    image: "/images/hatirjheel-waterfront.jpg",
    distance: "Km 18",
  },
  {
    icon: Palmtree,
    title: "Rampura Bridge",
    description: "Iconic Hatirjheel Bridge View",
    image: "/images/rampura-bridge.jpg",
    distance: "Km 28",
  },
  {
    icon: Landmark,
    title: "Badda Link Road",
    description: "Final Stretch Through Urban Core",
    image: "/images/badda-link.jpg",
    distance: "Km 38",
  },
  {
    icon: Trophy,
    title: "Finish Line",
    description: "Back to Hatirjheel Amphitheatre",
    image: "/images/hatirjheel-finish.jpg",
    distance: "Km 42.2",
  },
];

export default function CourseHighlights() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Course Highlights
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Run through the heart of Dhaka - experience Hatirjheel's stunning
            waterfront and the city's vibrant landmarks
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={highlight.image}
                  alt={highlight.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Icon */}
                <div className="absolute bottom-4 left-4 text-white">
                  <highlight.icon className="w-8 h-8 mb-2" />
                </div>

                {/* Distance Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {highlight.distance}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {highlight.title}
                </h3>
                <p className="text-gray-600">{highlight.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                42.2 km
              </div>
              <div className="text-gray-600">Total Distance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">~70%</div>
              <div className="text-gray-600">Along Hatirjheel</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">Flat</div>
              <div className="text-gray-600">Course Type</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold shadow-lg hover:shadow-xl">
            View Full Route Map
          </button>
          <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold">
            Download GPX File
          </button>
        </div>

        {/* Route Description */}
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">About the Route</h3>
          <p className="text-gray-600 leading-relaxed">
            The Dhaka Marathon course showcases the best of Bangladesh's capital
            city. Starting and finishing at the iconic Hatirjheel Amphitheatre,
            runners will enjoy a mostly flat, fast course along the beautiful
            Hatirjheel Lake waterfront. The route passes through Gulshan's
            diplomatic zone, Badda's vibrant neighborhoods, and returns via the
            scenic lakeside promenade - offering runners stunning water views
            and the energy of Dhaka's urban landscape.
          </p>
        </div>
      </div>
    </section>
  );
}
