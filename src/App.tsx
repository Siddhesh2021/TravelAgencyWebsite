import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation, useNavigate } from "react-router";

const images = {
  hero: "https://images.unsplash.com/photo-1627894485200-b92fb4353967?auto=format&fit=crop&w=2200&q=88",
  kashmir: "https://images.unsplash.com/photo-1569852837227-1d0d3af93456?auto=format&fit=crop&w=1200&q=84",
  ladakh: "https://images.unsplash.com/photo-1558187424-f786111643b0?auto=format&fit=crop&w=1200&q=84",
  meghalaya: "https://images.unsplash.com/photo-1742494267580-e026d3737f65?auto=format&fit=crop&w=1200&q=84",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=84",
  rajasthan: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=84",
  himachal: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1200&q=84",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=84",
  uttarakhand: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=84",
  group: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=84",
  friends: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=84",
  trek: "https://images.unsplash.com/photo-1548957175-84f0f9af659e?auto=format&fit=crop&w=1200&q=84",
};

const trips = [
  { name: "Kashmir", line: "Valleys, lakes & mountain villages", duration: "5D / 4N", date: "18–22 Oct", price: "₹24,999", badge: "Culture & nature", image: images.kashmir, seats: "12 seats left" },
  { name: "Ladakh", line: "High-altitude roads & unforgettable landscapes", duration: "7D / 6N", date: "24–30 Oct", price: "₹34,999", badge: "Adventure", image: images.ladakh, seats: "8 seats left" },
  { name: "Meghalaya", line: "Waterfalls, caves & living root bridges", duration: "6D / 5N", date: "02–07 Nov", price: "₹27,999", badge: "Slow travel", image: images.meghalaya, seats: "15 seats left" },
  { name: "Kerala", line: "Backwaters, beaches & slow travel", duration: "5D / 4N", date: "09–13 Nov", price: "₹21,999", badge: "Coastal", image: images.kerala, seats: "Filling fast" },
  { name: "Rajasthan", line: "Forts, deserts & royal cities", duration: "6D / 5N", date: "16–21 Nov", price: "₹25,999", badge: "Culture", image: images.rajasthan, seats: "10 seats left" },
  { name: "Himachal", line: "Mountains, forests & Himalayan towns", duration: "5D / 4N", date: "28 Nov–02 Dec", price: "₹19,999", badge: "Weekend+", image: images.himachal, seats: "6 seats left" },
];

const destinations = [
  ["Kashmir", "Alpine valleys & old Srinagar", images.kashmir],
  ["Ladakh", "High passes & quiet monasteries", images.ladakh],
  ["Himachal Pradesh", "Forest trails & mountain towns", images.himachal],
  ["Rajasthan", "Desert stories & royal cities", images.rajasthan],
  ["Kerala", "Backwaters & a slower rhythm", images.kerala],
  ["Meghalaya", "Rainforests & hidden falls", images.meghalaya],
  ["Goa", "Coastal roads & old quarters", images.goa],
  ["Uttarakhand", "Sacred towns & Himalayan trails", images.uttarakhand],
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    calendar: <><path d="M6 3v3M18 3v3M4 8h16" /><rect x="4" y="5" width="16" height="16" rx="2" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <path d="m12 2 3 6 7 .9-5 4.8 1.2 6.8L12 17.3l-6.2 3.2L7 13.7 2 8.9 9 8Z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></>,
    mountain: <><path d="m3 20 7-12 4 7 2-3 5 8Z" /><path d="m8 11 2 2 2-2" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-5 2 2-5Z" /></>,
  };
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>{paths[name]}</svg>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <button className={`logo ${inverse ? "logo--inverse" : ""}`} onClick={() => navigateTo("/")} aria-label="Roamly home">
    <span className="logo-mark"><Icon name="mountain" size={22} /></span>
    <span>roamly<span className="logo-dot">.</span></span>
  </button>;
}

let globalNavigate: ((path: string) => void) | null = null;
function navigateTo(path: string) { globalNavigate?.(path); }

function Button({ children, variant = "primary", icon, onClick, type = "button", className = "" }: { children: ReactNode; variant?: "primary" | "secondary" | "light" | "text"; icon?: string; onClick?: () => void; type?: "button" | "submit"; className?: string }) {
  return <button type={type} className={`btn btn--${variant} ${className}`} onClick={onClick}>{children}{icon && <Icon name={icon} size={18} />}</button>;
}

function Header({ onMenu, currentPath }: { onMenu: () => void; currentPath: string }) {
  const links = [["Explore Trips", "/trips"], ["Destinations", "/destinations"], ["Experiences", "/experiences"], ["About Us", "/about"]];
  return <header className="header">
    <div className="shell header-inner">
      <Logo />
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(([label, path]) => <button className={currentPath === path ? "active" : ""} key={path} onClick={() => navigateTo(path)}>{label}</button>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button search-button" aria-label="Search"><Icon name="search" /></button>
        <button className="login">Login</button>
        <Button onClick={() => navigateTo("/trips")}>Find a Trip</Button>
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      </div>
    </div>
  </header>;
}

function SectionTitle({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="section-heading">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{copy && <p className="section-copy">{copy}</p>}</div>
    {action}
  </div>;
}

function TripCard({ trip }: { trip: typeof trips[0] }) {
  return <article className="trip-card">
    <button className="trip-image-wrap" onClick={() => navigateTo("/trips/kashmir")} aria-label={`View ${trip.name} trip`}>
      <img src={trip.image} alt={`${trip.name} landscape`} className="trip-image" />
      <span className="badge badge--light">{trip.badge}</span>
    </button>
    <div className="trip-content">
      <div className="trip-top"><div><p className="trip-location"><Icon name="pin" size={15} />{trip.name}</p><h3>{trip.line}</h3></div><span className="availability"><i />{trip.seats}</span></div>
      <div className="trip-meta"><span><Icon name="clock" size={16} />{trip.duration}</span><span><Icon name="calendar" size={16} />{trip.date}</span></div>
      <div className="trip-footer"><div className="price"><small>Starts at</small><strong>{trip.price}</strong><small>/ person</small></div><Button variant="text" icon="arrow" onClick={() => navigateTo("/trips/kashmir")}>View Trip</Button></div>
    </div>
  </article>;
}

function SearchModule() {
  return <div className="search-module">
    <label><span><Icon name="pin" size={18} />Where do you want to go?</span><select defaultValue=""><option value="" disabled>Choose a destination</option><option>Kashmir</option><option>Ladakh</option><option>Meghalaya</option><option>Kerala</option></select></label>
    <label><span><Icon name="calendar" size={18} />When?</span><select><option>October 2025</option><option>November 2025</option><option>December 2025</option></select></label>
    <label><span><Icon name="compass" size={18} />Trip type</span><select><option>All experiences</option><option>Group trips</option><option>Adventure</option><option>Culture</option></select></label>
    <Button icon="arrow" onClick={() => document.querySelector("#trips")?.scrollIntoView({ behavior: "smooth" })}>Explore Trips</Button>
  </div>;
}

function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [toast, setToast] = useState(false);
  function subscribe(e: FormEvent) { e.preventDefault(); setToast(true); setTimeout(() => setToast(false), 3500); }
  return <main>
    <section className="hero">
      <img src={images.hero} alt="Traveller overlooking the mountains of Kashmir" />
      <div className="hero-shade" />
      <div className="shell hero-inner">
        <div className="hero-copy"><p className="eyebrow eyebrow--light">Explore India differently</p><h1>Trips you’ll remember.<br />Stories you’ll keep.</h1><p>Curated group journeys across India’s most incredible destinations.</p><div className="hero-actions"><Button onClick={() => document.querySelector("#trips")?.scrollIntoView({ behavior: "smooth" })} icon="arrow">Explore Trips</Button><Button variant="light" onClick={() => document.querySelector("#process")?.scrollIntoView({ behavior: "smooth" })}>How It Works</Button></div></div>
        <SearchModule />
      </div>
    </section>

    <section className="trust-strip"><div className="shell trust-grid">
      {[["5,000+", "happy travellers"], ["100+", "trips completed"], ["4.9 / 5", "traveller rating"], ["35", "states & UTs explored"], ["100%", "verified trip leaders"]].map(([value, label], i) => <div key={label}>{i === 2 && <Icon name="star" size={16} />}<strong>{value}</strong><span>{label}</span></div>)}
    </div></section>

    <section className="section shell" id="trips">
      <SectionTitle eyebrow="Curated departures" title="Where will you go next?" copy="Handpicked journeys across India, designed for people who want to experience more and plan less." action={<Button variant="secondary" icon="arrow">View all trips</Button>} />
      <div className="trip-grid">{trips.map(trip => <TripCard key={trip.name} trip={trip} />)}</div>
    </section>

    <section className="section section--tint" id="destinations"><div className="shell">
      <SectionTitle eyebrow="Explore by place" title="India, one journey at a time." copy="From high mountain passes to quiet coastal roads, find the part of India that calls you." />
      <div className="destination-grid">{destinations.map(([name, line, image], i) => <button className={`destination-card destination-card--${i + 1}`} key={name} onClick={() => navigateTo("/destinations")}><img src={image} alt="" /><span className="image-shade" /><span className="destination-info"><small>{line}</small><strong>{name}</strong><span>Explore <Icon name="arrow" size={16} /></span></span></button>)}</div>
    </div></section>
    <ScrollJourney />

    <section className="section shell" id="categories">
      <SectionTitle eyebrow="Find your kind of journey" title="Go for what moves you." />
      <div className="category-row">{[
        ["clock", "Weekend Getaways", "2–4 days"],
        ["compass", "Adventure", "For the wild-hearted"],
        ["mountain", "Mountains", "Higher perspectives"],
        ["star", "Cultural", "Stories & traditions"],
        ["users", "Group Trips", "Come solo, leave together"],
        ["shield", "Solo-Friendly", "Safe, social, supported"],
      ].map(([icon, title, line]) => <button className="category-card" key={title}><span><Icon name={icon} /></span><strong>{title}</strong><small>{line}</small><Icon name="arrow" size={18} /></button>)}</div>
    </section>

    <section className="section process-section" id="process"><div className="shell">
      <SectionTitle eyebrow="Simple by design" title="Four steps. Zero travel admin." copy="We handle the moving parts so you can stay present for the good parts." />
      <div className="process-grid">{[
        ["01", "Choose your trip", "Browse clear itineraries, dates and prices."],
        ["02", "Reserve your seat", "Secure your place in just a few minutes."],
        ["03", "Meet your travel group", "Join the group chat before you set off."],
        ["04", "Travel, fully organized", "Stays, transport and support are sorted."],
      ].map(([n, title, copy]) => <div className="process-step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div>
    </div></section>

    <section className="section shell why-grid" id="why">
      <div className="why-image"><img src={images.group} alt="Friends travelling together in the mountains" /><div className="why-stat"><strong>9 in 10</strong><span>travellers would travel with us again</span></div></div>
      <div className="why-content"><p className="eyebrow">The Roamly standard</p><h2>Everything is planned.<br />You just show up.</h2><p>Thoughtful trips, capable people and no fine-print surprises.</p><div className="feature-list">{[
        ["Experienced trip leaders", "Local knowledge, practical support and a human point of contact throughout."],
        ["Transparent pricing", "No surprise costs or confusing packages."],
        ["Small-group experiences", "Travel with people, not crowds."],
        ["Verified stays & transport", "Comfortable, reliable and carefully selected partners."],
        ["24/7 trip support", "Help whenever you need it."],
      ].map(([title, line]) => <div className="feature-item" key={title}><span><Icon name="check" size={17} /></span><div><strong>{title}</strong><p>{line}</p></div></div>)}</div></div>
    </section>

    <section className="section stories-section"><div className="shell">
      <SectionTitle eyebrow="Traveller stories" title="Straight from the group chat." copy="Honest notes from people who have taken the trip." />
      <div className="story-grid">{[
        ["Aanya Mehta", "Mumbai", "Kashmir · May 2025", "Everything was planned perfectly, but it never felt rigid. We had enough freedom to explore on our own.", images.friends],
        ["Rohan Kapoor", "Bengaluru", "Ladakh · June 2025", "I arrived solo and left with a group I’m still planning trips with. Our trip lead was calm, funny and excellent.", images.group],
        ["Mira Thomas", "Pune", "Meghalaya · July 2025", "The stays felt considered, the days were paced well, and every place felt more special than the photos.", images.trek],
      ].map(([name, city, trip, quote, image]) => <article className="story-card" key={name}><div className="stars">{[1,2,3,4,5].map(x => <Icon name="star" size={15} key={x} />)}</div><blockquote>“{quote}”</blockquote><div className="profile"><img src={image} alt="" /><div><strong>{name}</strong><span>{city} · {trip}</span></div></div></article>)}</div>
    </div></section>

    <section className="section shell social-section">
      <SectionTitle eyebrow="@roamlyindia" title="See where our travellers are going." action={<Button variant="secondary"><Icon name="instagram" size={18} />Follow on Instagram</Button>} />
      <div className="social-grid">{[images.kashmir, images.group, images.rajasthan, images.meghalaya, images.ladakh, images.kerala].map((img, i) => <div key={img} className={`social-tile social-tile--${i + 1}`}><img src={img} alt="Roamly traveller moment" /></div>)}</div>
    </section>
    <ReelsSection />

    <section className="section upcoming-section"><div className="shell">
      <SectionTitle eyebrow="Pack sooner" title="Upcoming departures" copy="Limited seats, confirmed departures and no hidden surprises." />
      <div className="departure-list">{trips.slice(0, 4).map((trip, i) => <button className="departure-row" key={trip.name} onClick={() => navigateTo("/trips/kashmir")}><div className="date-block"><strong>{["18", "24", "02", "09"][i]}</strong><span>{i < 2 ? "OCT" : "NOV"}</span></div><img src={trip.image} alt="" /><div className="departure-place"><strong>{trip.name}</strong><span>{trip.line}</span></div><span className="desktop-only">{trip.duration}</span><span className="departure-price">{trip.price}<small>per person</small></span><span className="availability"><i />{trip.seats}</span><span className="round-arrow"><Icon name="arrow" size={18} /></span></button>)}</div>
    </div></section>

    <section className="section shell faq-section"><div><p className="eyebrow">Good to know</p><h2>The stuff everyone asks.</h2><p>Still unsure? Our trip experts are one call away.</p><Button variant="secondary">Talk to a trip expert</Button></div><div className="faq-list">{[
      ["Can I join a group trip solo?", "Absolutely. Around 65% of our travellers join solo. We keep groups welcoming and introduce everyone before departure."],
      ["What is included in the trip price?", "Your stays, intercity and local transport, listed meals, experiences, permits and a dedicated trip leader are included."],
      ["How large are the groups?", "Most departures have 12–18 travellers: enough to feel social, small enough to stay flexible."],
      ["Can I pay in instalments?", "Yes. Reserve with 25% and pay the balance in simple instalments before departure."],
    ].map(([q, a], i) => <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={q}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><strong>{q}</strong><Icon name="chevron" /></button><div><p>{a}</p></div></div>)}</div></section>

    <section className="newsletter"><div className="shell newsletter-inner"><div><p className="eyebrow eyebrow--light">Notes from the road</p><h2>Your next trip starts here.</h2><p>Get new departures, destination guides and limited-seat trips in your inbox.</p></div><form onSubmit={subscribe}><input type="email" aria-label="Email address" placeholder="Email address" required /><Button type="submit">Subscribe</Button><small>No spam. Just good places and useful travel notes.</small></form></div></section>
    <MobilePageCta />
    {toast && <div className="toast"><span><Icon name="check" /></span><div><strong>You’re on the list.</strong><small>Watch your inbox for the next great escape.</small></div></div>}
  </main>;
}

function ReelsSection() {
  const reels = [
    ["48 hours in Kashmir", "Dal Lake at 6:12 AM", images.kashmir, "128K"],
    ["Why strangers become friends", "A Roamly group in Ladakh", images.group, "94K"],
    ["The road into Meghalaya", "Rain, roots and hidden rivers", images.meghalaya, "81K"],
    ["Golden hour in Jaisalmer", "Desert camp diaries", images.rajasthan, "76K"],
  ];
  return <section className="section reels-section"><div className="shell">
    <SectionTitle eyebrow="Roamly, in motion" title="Watch the journey unfold." copy="Quick stories, real groups and the little moments that rarely make the itinerary." action={<Button variant="secondary"><Icon name="instagram" size={18} />Watch all reels</Button>} />
    <div className="reels-track">{reels.map(([title, copy, image, views], i) => <button className="reel-card" key={title}>
      <img src={image} alt="" /><span className="reel-shade" />
      <span className="reel-top"><Icon name="instagram" size={17} /> REEL</span>
      <span className="reel-play"><span /><span /></span>
      <span className="reel-copy"><small>{views} plays</small><strong>{title}</strong><span>{copy}</span></span>
      <span className="reel-index">0{i + 1}</span>
    </button>)}</div>
  </div></section>;
}

function ScrollJourney() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const chapters = [
    ["01", "Wake up above the clouds", "Ladakh", "Cross high passes with a trip leader who knows when to pause, where the best chai is, and how to keep the day comfortable.", images.ladakh],
    ["02", "Follow the rain into the forest", "Meghalaya", "Walk living root bridges, swim below hidden falls and let the Northeast reveal itself one unhurried day at a time.", images.meghalaya],
    ["03", "Slow down by the water", "Kerala", "Trade checklists for backwaters, coastal kitchens and mornings that begin whenever you’re ready.", images.kerala],
    ["04", "End the day under desert skies", "Rajasthan", "Move through old cities and open desert with local stories that turn monuments into memories.", images.rajasthan],
  ];
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      });
    }, { rootMargin: "-38% 0px -42% 0px", threshold: 0 });
    stepRefs.current.forEach(node => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return <section className="scroll-journey"><div className="shell scroll-journey-layout">
    <div className="scroll-visual">
      {chapters.map(([,, place,, image], i) => <img className={active === i ? "active" : ""} src={image} alt={`${place} landscape`} key={place} />)}
      <span className="scroll-visual-shade" />
      <div className="scroll-location"><Icon name="pin" size={16} /><span>Now exploring</span><strong>{chapters[active][2]}</strong></div>
      <div className="scroll-progress">{chapters.map((chapter, i) => <span className={active === i ? "active" : ""} key={chapter[0]} />)}</div>
    </div>
    <div className="scroll-chapters"><div className="scroll-intro"><p className="eyebrow">A journey through India</p><h2>Every few hundred kilometres, everything changes.</h2><p>Scroll through four very different reasons to pack a bag.</p></div>
      {chapters.map(([number, title, place, copy], i) => <article data-index={i} ref={node => { stepRefs.current[i] = node; }} className={active === i ? "active" : ""} key={number}><span>{number}</span><small>{place}</small><h3>{title}</h3><p>{copy}</p><button onClick={() => navigateTo("/destinations")}>Explore {place} <Icon name="arrow" size={17} /></button></article>)}
    </div>
  </div></section>;
}

function MobilePageCta() {
  return <div className="mobile-page-cta"><div><small>Ready when you are</small><strong>Find your next trip</strong></div><Button onClick={() => navigateTo("/trips")} icon="arrow">Explore</Button></div>;
}

function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: string; copy: string; image: string }) {
  return <section className="page-hero"><img src={image} alt="" /><span className="page-hero-shade" /><div className="shell"><p className="eyebrow eyebrow--light">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div><span className="hero-orbit hero-orbit--one" /><span className="hero-orbit hero-orbit--two" /></section>;
}

function TripsPage() {
  const [filter, setFilter] = useState("All trips");
  const filters = ["All trips", "Upcoming", "Weekend", "Adventure", "Culture", "Solo-friendly"];
  return <main>
    <PageHero eyebrow="100+ journeys and counting" title="Find the trip that fits." copy="Clear dates, honest prices and thoughtfully paced journeys across India." image={images.ladakh} />
    <section className="section shell trips-page">
      <div className="filter-toolbar"><div>{filters.map(x => <button className={filter === x ? "active" : ""} key={x} onClick={() => setFilter(x)}>{x}</button>)}</div><button className="sort-button">Sort: Recommended <Icon name="chevron" size={16} /></button></div>
      <div className="result-intro"><div><p className="eyebrow">Explore departures</p><h2>{filter === "All trips" ? "All curated trips" : filter}</h2></div><span>Showing 6 of 48 journeys</span></div>
      <div className="trip-grid">{trips.map(trip => <TripCard key={trip.name} trip={trip} />)}</div>
      <div className="load-more"><Button variant="secondary">Load more journeys</Button></div>
    </section>
    <section className="page-cta"><div className="shell"><div><p className="eyebrow eyebrow--light">Not sure where to start?</p><h2>Tell us your dates. We’ll shortlist the right trips.</h2></div><Button onClick={() => navigateTo("/experiences")}>Help me choose</Button></div></section>
    <MobilePageCta />
  </main>;
}

function DestinationsPage() {
  const regions = [["North", "Snow lines, cedar forests and high roads", "Kashmir · Ladakh · Himachal · Uttarakhand"], ["West", "Desert cities, salt flats and coastal nights", "Rajasthan · Gujarat · Goa"], ["South", "Backwaters, plantations and old port towns", "Kerala · Karnataka · Tamil Nadu"], ["East & Northeast", "Rainforests, monasteries and living traditions", "Meghalaya · Sikkim · Assam · Arunachal"]];
  return <main>
    <PageHero eyebrow="Across 35 states & union territories" title="A country worth taking your time with." copy="Explore India by landscape, season and the stories you want to bring home." image={images.kashmir} />
    <section className="section shell"><SectionTitle eyebrow="Explore the map" title="Where India changes pace." copy="Every region has its own rhythm. Start with the one that sounds like yours." />
      <div className="destination-page-grid">{destinations.map(([name, line, image], i) => <button key={name} className="destination-page-card" onClick={() => navigateTo("/trips/kashmir")}><span className="destination-number">0{i + 1}</span><img src={image} alt="" /><span className="image-shade" /><span><small>{line}</small><strong>{name}</strong><em>See trips <Icon name="arrow" size={17} /></em></span></button>)}</div>
    </section>
    <section className="section region-section"><div className="shell"><SectionTitle eyebrow="Go by region" title="Four corners. A hundred different Indias." /><div className="region-grid">{regions.map(([name, copy, places]) => <article key={name}><span><Icon name="compass" /></span><h3>{name}</h3><p>{copy}</p><small>{places}</small></article>)}</div></div></section>
    <ReelsSection /><MobilePageCta />
  </main>;
}

function ExperiencesPage() {
  const experiences = [
    ["Weekend Getaways", "Leave Friday. Return with a story.", images.himachal, "2–4 days"],
    ["High-altitude Adventure", "Big landscapes, capable leaders.", images.ladakh, "5–9 days"],
    ["Culture & Craft", "Places understood through their people.", images.rajasthan, "4–7 days"],
    ["Coastal Slow Travel", "Salt air and room to wander.", images.kerala, "4–6 days"],
    ["Solo-Friendly Groups", "Come by yourself. Never feel alone.", images.group, "12–18 people"],
    ["Nature & Wildlife", "Forests, rivers and early starts.", images.meghalaya, "4–8 days"],
  ];
  return <main>
    <PageHero eyebrow="Travel your way" title="More than a destination." copy="Choose how you want a trip to feel — adventurous, social, unhurried or deeply local." image={images.group} />
    <section className="section shell"><SectionTitle eyebrow="Experience collections" title="Start with what moves you." copy="Built around a shared interest, then planned down to the last practical detail." />
      <div className="experience-grid">{experiences.map(([title, copy, image, meta], i) => <button key={title} onClick={() => navigateTo("/trips")}><div><img src={image} alt="" /><span className="experience-icon"><Icon name={i % 2 ? "compass" : "mountain"} /></span></div><small>{meta}</small><h3>{title}</h3><p>{copy}</p><span className="text-link">Explore collection <Icon name="arrow" size={17} /></span></button>)}</div>
    </section>
    <section className="section quiz-section"><div className="shell quiz-layout"><div><p className="eyebrow eyebrow--light">60-second trip matcher</p><h2>Mountains or coast? Early starts or slow mornings?</h2><p>Answer five quick questions and get a shortlist made for your travel style.</p><Button>Find my travel style</Button></div><div className="quiz-graphic"><span>01</span><strong>What does a perfect morning look like?</strong><button>Chai with a mountain view</button><button>Barefoot by the sea</button><button>Walking through an old city</button></div></div></section>
    <ReelsSection /><MobilePageCta />
  </main>;
}

function AboutPage() {
  return <main>
    <PageHero eyebrow="Our story" title="Travel more. Plan less." copy="Roamly exists to make group travel across India feel easier, more human and worth remembering." image={images.friends} />
    <section className="section shell about-intro"><div><p className="eyebrow">Why we started</p><h2>Great trips shouldn’t require a second full-time job.</h2></div><div><p>We were tired of choosing between rigid package tours and weeks of planning every cab, stay and permit ourselves. So we built the kind of journey we wanted to take: thoughtfully organized, locally grounded and flexible enough to still feel like an adventure.</p><p>Today, our team works with trip leaders and independent partners across India to create small-group experiences that are safe, social and genuinely connected to place.</p></div></section>
    <section className="impact-section"><div className="shell impact-grid">{[["100+", "professionally managed trips"], ["5,000+", "travellers in our community"], ["35", "states & UTs explored"], ["4.9 / 5", "average traveller rating"]].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
    <section className="section shell"><SectionTitle eyebrow="The people behind the plans" title="Travel people. Detail people." copy="A small team of route planners, community builders and trip leaders who care about both the view and the pickup time." />
      <div className="team-grid">{[["Naina Rao", "Founder · Product & journeys", images.friends], ["Kabir Shah", "Head of trip operations", images.group], ["Tsering Dolma", "Lead captain · Himalayas", images.trek]].map(([name, role, image]) => <article key={name}><img src={image} alt="" /><h3>{name}</h3><span>{role}</span></article>)}</div>
    </section>
    <section className="section values-section"><div className="shell"><SectionTitle eyebrow="How we work" title="The standards we don’t compromise on." /><div className="value-grid">{[["Clarity over fine print", "What you see is what you pay. Every inclusion is written in plain language."], ["Local over generic", "We work with people who know the roads, stories and rhythms of each place."], ["Groups, not crowds", "Small groups make better conversations and more flexible journeys."], ["Care in the details", "From room checks to weather backups, practical planning makes freedom possible."]].map(([title, copy], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <ReelsSection /><MobilePageCta />
  </main>;
}

function TripDetail() {
  const [faq, setFaq] = useState(0);
  return <main className="detail-page">
    <div className="shell breadcrumb"><button onClick={() => navigateTo("/")}>Home</button><span>/</span><button onClick={() => navigateTo("/trips")}>India trips</button><span>/</span><strong>Kashmir</strong></div>
    <section className="shell detail-hero">
      <div className="detail-title"><div><p className="eyebrow">Small-group journey · Kashmir</p><h1>Kashmir — The Great Valley Escape</h1><p>Slow mornings on Dal Lake, alpine valleys and village roads beneath the Pir Panjal.</p></div><div className="rating"><span><Icon name="star" size={17} />4.9</span><small>124 reviews</small></div></div>
      <div className="gallery"><img src={images.kashmir} alt="Kashmir lake and mountains" /><img src="https://images.unsplash.com/photo-1614591276564-7b3e69347a48?auto=format&fit=crop&w=900&q=85" alt="Houseboats on Dal Lake" /><img src="https://images.unsplash.com/photo-1564327287902-0ccf559d839e?auto=format&fit=crop&w=900&q=85" alt="Floating market in Kashmir" /><button>View all 18 photos</button></div>
      <div className="detail-facts">{[["clock", "Duration", "5 days / 4 nights"], ["users", "Group size", "12–18 travellers"], ["mountain", "Difficulty", "Easy to moderate"], ["calendar", "Next departure", "18 October 2025"]].map(([icon, label, value]) => <div key={label}><span><Icon name={icon} /></span><p><small>{label}</small><strong>{value}</strong></p></div>)}</div>
    </section>
    <div className="detail-nav"><div className="shell"><button onClick={() => document.querySelector("#overview")?.scrollIntoView({ behavior: "smooth" })}>Overview</button><button onClick={() => document.querySelector("#itinerary")?.scrollIntoView({ behavior: "smooth" })}>Itinerary</button><button>Inclusions</button><button>Stay & transport</button><button>Reviews</button></div></div>
    <div className="shell detail-layout">
      <div className="detail-main">
        <section id="overview"><p className="eyebrow">The journey</p><h2>A gentler way to see Kashmir.</h2><p className="lead">Five well-paced days through Srinagar, Gulmarg and Pahalgam — with local stories, good food and enough unplanned time to make the journey your own.</p><div className="highlight-grid">{["Shikara sunrise on Dal Lake", "Gulmarg gondola & meadow walk", "Pahalgam village trail", "Kashmiri wazwan dinner", "Handpicked boutique stays", "Dedicated Roamly trip leader"].map(x => <div key={x}><Icon name="check" size={17} />{x}</div>)}</div></section>
        <section id="itinerary"><p className="eyebrow">Day by day</p><h2>Your itinerary</h2><div className="timeline">{[
          ["Day 01", "Arrive in Srinagar", "Meet your trip leader and group, settle into your houseboat, then take an evening shikara ride as the lake quietens."],
          ["Day 02", "Srinagar, slowly", "Walk the old city with a local storyteller, visit the Mughal gardens and share a traditional wazwan dinner."],
          ["Day 03", "The meadows of Gulmarg", "Drive to Gulmarg for the gondola, an easy meadow walk and a warm café stop before returning to Srinagar."],
          ["Day 04", "Pahalgam village trails", "Follow the Lidder River, meet local makers and spend the night in a quiet mountain stay."],
          ["Day 05", "A slow last morning", "Breakfast overlooking the valley, goodbyes with the group and a supported transfer to Srinagar airport."],
        ].map(([day, title, copy]) => <div className="timeline-item" key={day}><span>{day}</span><div><h3>{title}</h3><p>{copy}</p><small>Stay included · Breakfast included</small></div></div>)}</div></section>
        <section><div className="two-column-info"><div><p className="eyebrow">All sorted</p><h2>What’s included</h2>{["4 nights in verified stays", "All local transport", "4 breakfasts & 2 dinners", "All listed experiences", "Permits and entry fees", "Dedicated trip leader", "24/7 on-trip support"].map(x => <p className="check-row" key={x}><Icon name="check" size={17} />{x}</p>)}</div><div><p className="eyebrow">Bring your own</p><h2>Not included</h2>{["Flights to and from Srinagar", "Lunches and unlisted meals", "Personal shopping", "Travel insurance", "Anything not listed above"].map(x => <p className="minus-row" key={x}><span>—</span>{x}</p>)}</div></div></section>
        <section><p className="eyebrow">Rest easy</p><h2>Stay & transport</h2><div className="stay-card"><img src="https://images.unsplash.com/photo-1575336127377-71c4af9ce931?auto=format&fit=crop&w=900&q=85" alt="Houseboats on Dal Lake" /><div><h3>Houseboats & boutique mountain stays</h3><p>Double occupancy rooms, ensuite bathrooms, reliable hot water and places chosen for warmth, location and character.</p><span>Private tempo traveller throughout</span></div></div></section>
        <section><p className="eyebrow">Your person on the ground</p><h2>Meet your trip leader</h2><div className="leader-card"><img src={images.group} alt="" /><div><h3>Arjun Rawat</h3><span>Lead trip captain · 38 journeys</span><p>Mountain person, logistics obsessive and the one who always knows the best chai stop.</p><div className="stars"><Icon name="star" size={15} /><strong>4.9 leader rating</strong></div></div></div></section>
        <section><p className="eyebrow">Meeting point</p><h2>Srinagar International Airport</h2><p>Shared transfers leave at 12:30 PM and 3:30 PM on Day 1. Exact meeting instructions arrive 7 days before departure.</p><div className="meeting-map"><Icon name="pin" size={28} /><strong>Srinagar, Jammu & Kashmir</strong></div></section>
        <section><p className="eyebrow">Before you book</p><h2>FAQs & cancellation</h2><div className="faq-list">{[
          ["Is this trip suitable for first-time group travellers?", "Yes. The pace is comfortable, and your trip leader handles every transfer and check-in."],
          ["What should I pack?", "Layers, comfortable walking shoes, sun protection and a small daypack. We send a season-specific list."],
          ["What is the cancellation policy?", "Cancel 30+ days before departure for a 90% refund. Between 15–29 days, receive 50% back or full travel credit."],
        ].map(([q, a], i) => <div className={`faq-item ${faq === i ? "open" : ""}`} key={q}><button onClick={() => setFaq(faq === i ? -1 : i)}><strong>{q}</strong><Icon name="chevron" /></button><div><p>{a}</p></div></div>)}</div></section>
      </div>
      <aside className="booking-card"><span className="badge">Next departure · 18 Oct</span><div className="booking-price"><small>Starting from</small><strong>₹24,999</strong><span>per person</span></div><label>Choose departure<select><option>18–22 October · 12 seats</option><option>08–12 November · 9 seats</option><option>21–25 December · 6 seats</option></select></label><div className="mini-row"><span>Trip price</span><strong>₹24,999</strong></div><div className="mini-row"><span>Taxes</span><strong>Included</strong></div><Button className="full" onClick={() => navigateTo("/booking")}>Reserve Your Seat</Button><small className="secure"><Icon name="shield" size={15} />Secure checkout · Free date changes for 48 hours</small><button className="expert-link">Questions? Talk to a trip expert</button></aside>
    </div>
    <div className="mobile-booking-bar"><div><small>From</small><strong>₹24,999</strong></div><Button onClick={() => navigateTo("/booking")}>Reserve Your Seat</Button></div>
  </main>;
}

const bookingSteps = ["Departure", "Travellers", "Your details", "Add-ons", "Payment", "Confirmed"];
function BookingFlow() {
  const [step, setStep] = useState(0);
  const [travellers, setTravellers] = useState(1);
  const [selectedDate, setSelectedDate] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);
  const next = () => { setStep(s => Math.min(5, s + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => setStep(s => Math.max(0, s - 1));
  const addOnTotal = addons.length * 1499;
  return <main className="booking-page">
    <div className="booking-header shell"><Logo /><button onClick={() => navigateTo("/trips/kashmir")}><Icon name="close" />Exit booking</button></div>
    <div className="booking-progress-wrap"><div className="shell booking-progress">{bookingSteps.map((label, i) => <div className={`${i < step ? "done" : ""} ${i === step ? "active" : ""}`} key={label}><span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span><small>{label}</small></div>)}</div></div>
    {step < 5 ? <div className="shell checkout-layout">
      <section className="checkout-card">
        {step === 0 && <><p className="eyebrow">Step 1 of 5</p><h1>Choose your departure</h1><p className="lead">All listed departures are confirmed. Pick the dates that work for you.</p><div className="date-options">{[["18–22 October 2025", "12 seats left", "₹24,999"], ["08–12 November 2025", "9 seats left", "₹25,999"], ["21–25 December 2025", "6 seats left", "₹28,999"]].map((d, i) => <button className={selectedDate === i ? "selected" : ""} onClick={() => setSelectedDate(i)} key={d[0]}><span className="radio" /><div><strong>{d[0]}</strong><small><i />{d[1]}</small></div><strong>{d[2]}</strong></button>)}</div></>}
        {step === 1 && <><p className="eyebrow">Step 2 of 5</p><h1>Who’s travelling?</h1><p className="lead">You can add details for everyone in the next step.</p><div className="counter-row"><div><strong>Adults</strong><small>Age 18 and above</small></div><div className="counter"><button onClick={() => setTravellers(Math.max(1, travellers - 1))}>−</button><strong>{travellers}</strong><button onClick={() => setTravellers(Math.min(8, travellers + 1))}>+</button></div></div><div className="info-note"><Icon name="users" /><p><strong>Travelling solo?</strong><br />You’re in good company — most Roamly travellers join on their own.</p></div></>}
        {step === 2 && <><p className="eyebrow">Step 3 of 5</p><h1>Traveller information</h1><p className="lead">Lead traveller details. We’ll collect the rest securely after booking.</p><div className="form-grid"><label><span>First name</span><input placeholder="Aanya" /></label><label><span>Last name</span><input placeholder="Mehta" /></label><label className="full-field"><span>Email address</span><input type="email" placeholder="aanya@example.com" /></label><label><span>Mobile number</span><input placeholder="+91 98765 43210" /></label><label><span>City</span><input placeholder="Mumbai" /></label><label className="full-field checkbox"><input type="checkbox" defaultChecked /><span>Send trip updates and booking details on WhatsApp.</span></label></div></>}
        {step === 3 && <><p className="eyebrow">Step 4 of 5</p><h1>Make it yours</h1><p className="lead">Optional extras, chosen for this journey. Add or skip freely.</p><div className="addon-list">{[["Travel insurance", "Trip cancellation and medical cover", "₹1,499"], ["Private room upgrade", "Your own room for all four nights", "₹7,999"], ["Airport arrival transfer", "Private pickup outside shared transfer hours", "₹1,499"]].map(([title, copy, price]) => <button className={addons.includes(title) ? "selected" : ""} key={title} onClick={() => setAddons(x => x.includes(title) ? x.filter(a => a !== title) : [...x, title])}><span className="check-box">{addons.includes(title) && <Icon name="check" size={14} />}</span><div><strong>{title}</strong><small>{copy}</small></div><strong>{price}</strong></button>)}</div></>}
        {step === 4 && <><p className="eyebrow">Step 5 of 5</p><h1>Secure payment</h1><p className="lead">Pay a 25% deposit today. Your balance is due 30 days before departure.</p><div className="payment-tabs"><button className="active">Card</button><button>UPI</button><button>Net banking</button></div><div className="form-grid"><label className="full-field"><span>Card number</span><input placeholder="1234 5678 9012 3456" /></label><label><span>Expiry</span><input placeholder="MM / YY" /></label><label><span>CVV</span><input placeholder="•••" /></label><label className="full-field"><span>Name on card</span><input placeholder="Aanya Mehta" /></label></div><div className="secure-panel"><Icon name="shield" /><p><strong>Your payment is protected.</strong><br />256-bit SSL encryption. We never store your card details.</p></div></>}
        <div className="checkout-actions">{step > 0 ? <Button variant="secondary" onClick={back}>Back</Button> : <span />}<Button onClick={next} icon={step === 4 ? undefined : "arrow"}>{step === 4 ? "Pay deposit securely" : "Continue"}</Button></div>
      </section>
      <aside className="order-summary"><h3>Your trip</h3><img src={images.kashmir} alt="Kashmir" /><strong>Kashmir — The Great Valley Escape</strong><span><Icon name="calendar" size={16} />18–22 October 2025</span><span><Icon name="users" size={16} />{travellers} traveller{travellers > 1 ? "s" : ""}</span><hr /><div><span>Trip total</span><strong>₹{(24999 * travellers).toLocaleString("en-IN")}</strong></div>{addons.length > 0 && <div><span>Add-ons</span><strong>₹{addOnTotal.toLocaleString("en-IN")}</strong></div>}<div className="total"><span>Due today</span><strong>₹{Math.round((24999 * travellers + addOnTotal) * .25).toLocaleString("en-IN")}</strong></div><small>Includes all taxes. Balance due 18 Sep 2025.</small></aside>
    </div> : <section className="confirmation shell"><span className="confirmation-icon"><Icon name="check" size={34} /></span><p className="eyebrow">Booking confirmed</p><h1>Kashmir is officially on your calendar.</h1><p>Your reservation <strong>#RM-KAS-1842</strong> is confirmed. We’ve sent everything you need to aanya@example.com.</p><div className="confirmation-card"><img src={images.kashmir} alt="" /><div><small>18–22 October 2025</small><h3>Kashmir — The Great Valley Escape</h3><span>1 traveller · 5 days / 4 nights</span></div></div><div className="confirmation-actions"><Button onClick={() => navigateTo("/")}>Back to home</Button><Button variant="secondary">View booking details</Button></div></section>}
  </main>;
}

function Footer() {
  return <footer className="footer"><div className="shell footer-grid"><div className="footer-brand"><Logo inverse /><p>Thoughtfully planned group journeys across India. Travel more. Plan less.</p><div className="trust-note"><Icon name="shield" size={17} />Secure payments · Verified partners</div></div>{[
    ["Explore", "All Trips,Destinations,Experiences,Upcoming Departures"],
    ["Company", "About,Our Story,Trip Leaders,Contact"],
    ["Support", "FAQs,Cancellation Policy,Terms,Privacy Policy"],
    ["Follow", "Instagram,YouTube,Facebook"],
  ].map(([title, links]) => <div className="footer-col" key={title}><strong>{title}</strong>{links.split(",").map(x => <button key={x}>{x}</button>)}</div>)}</div><div className="shell footer-bottom"><span>© 2025 Roamly Travel Co. Private Limited</span><span>Made with care in India</span></div></footer>;
}

function SiteLayout() {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isBooking = location.pathname === "/booking";
  globalNavigate = (next) => { navigate(next); setMenu(false); };
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [location.pathname]);
  useEffect(() => { document.body.style.overflow = menu ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menu]);
  return <div className="app">
    {!isBooking && <Header currentPath={location.pathname} onMenu={() => setMenu(true)} />}
    {menu && <div className="mobile-menu"><div><Logo /><button className="icon-button" onClick={() => setMenu(false)}><Icon name="close" /></button></div><nav>{[["Explore Trips", "/trips"], ["Destinations", "/destinations"], ["Experiences", "/experiences"], ["About Us", "/about"]].map(([label, path]) => <button key={path} onClick={() => navigateTo(path)}>{label}<Icon name="arrow" /></button>)}</nav><Button onClick={() => navigateTo("/trips")}>Find a Trip</Button></div>}
    <div className="route-transition" key={location.pathname}><Outlet /></div>
    {!isBooking && <Footer />}
  </div>;
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: SiteLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "trips", Component: TripsPage },
      { path: "destinations", Component: DestinationsPage },
      { path: "experiences", Component: ExperiencesPage },
      { path: "about", Component: AboutPage },
      { path: "trips/kashmir", Component: TripDetail },
      { path: "booking", Component: BookingFlow },
      { path: "*", Component: HomePage },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
