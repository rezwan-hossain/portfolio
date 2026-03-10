const ContactHero = () => {
  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-secondary px-6 py-20 md:min-h-[60vh] md:py-28 lg:min-h-[70vh]">
      {/* Giant CONTACT text */}
      <h1 className="select-none font-display text-[18vw] font-extrabold leading-[0.85] tracking-tighter text-secondary-foreground md:text-[14vw] lg:text-[12vw]">
        CONTACT
      </h1>

      {/* Floating Label - Event Trips */}
      <div className="absolute bottom-[15%] left-[5%] animate-float md:bottom-[20%] md:left-[8%]">
        <div className="rounded-sm border-2 border-foreground bg-highlight px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-highlight-foreground md:px-5 md:py-2 md:text-sm">
          EVENT TRIPS
        </div>
      </div>

      {/* Floating Label - Blog Details */}
      <div className="absolute right-[8%] top-[20%] animate-float-alt md:right-[12%] md:top-[22%]">
        <div className="rounded-sm border-2 border-foreground bg-accent px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-accent-foreground md:px-5 md:py-2 md:text-sm">
          BLOG DETAILS
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
