
import { Link } from "react-router-dom";

const services = [
  {
    number: "01",
    icon: "♡",
    title: "Individual Therapy",
    description:
      "A dedicated space to explore personal challenges, understand your emotions and work towards meaningful personal growth.",
    features: ["Personal support", "One-to-one sessions", "Self-understanding"],
  },
  {
    number: "02",
    icon: "♧",
    title: "Relationship Counselling",
    description:
      "Explore relationship challenges, improve communication and develop healthier ways of connecting with others.",
    features: ["Better communication", "Relationship support", "Mutual understanding"],
  },
  {
    number: "03",
    icon: "✦",
    title: "Self-Discovery",
    description:
      "Understand your thoughts, recognize your strengths and create space for reflection and personal development.",
    features: ["Personal reflection", "Self-awareness", "Personal growth"],
  },
  {
    number: "04",
    icon: "☁",
    title: "Emotional Wellbeing",
    description:
      "Find professional support in understanding emotional experiences and developing healthy ways to navigate everyday challenges.",
    features: ["Emotional awareness", "Coping strategies", "Ongoing support"],
  },
  {
    number: "05",
    icon: "⌂",
    title: "Student Support",
    description:
      "Navigate academic pressure, personal transitions and the challenges that can come with student life.",
    features: ["Academic pressure", "Personal challenges", "Life transitions"],
  },
  {
    number: "06",
    icon: "◇",
    title: "Professional Wellbeing",
    description:
      "Make space for your wellbeing while navigating workplace stress, professional responsibilities and career transitions.",
    features: ["Workplace stress", "Work-life balance", "Career transitions"],
  },
];

const Services = () => {
  return (
    <div className="services-page">

      {/* HERO SECTION */}
      <section className="services-hero">
        <div className="container services-hero-content">
          <span className="section-label">OUR SERVICES</span>

          <h1>
            Support that meets
            <br />
            <span>you where you are.</span>
          </h1>

          <p>
            Everyone's journey is different. Explore the
            different ways Unfazed helps you connect with
            professional support.
          </p>

          <Link to="/therapists" className="btn btn-primary">
            Find a Therapist →
          </Link>
        </div>
      </section>

      {/* SERVICES INTRODUCTION */}
      <section className="section services-intro">
        <div className="container services-intro-content">
          <span className="section-label">EXPLORE YOUR OPTIONS</span>

          <h2 className="section-heading">
            Different needs. Thoughtful support.
          </h2>

          <p className="section-description">
            Whether you're looking for someone to talk to,
            navigating a difficult period or simply exploring
            personal growth, there's a starting point for you.
          </p>
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section className="services-list-section">
        <div className="container">
          <div className="services-page-grid">
            {services.map((service) => (
              <article className="services-page-card" key={service.number}>
                <div className="services-page-card-top">
                  <span className="services-page-icon">
                    {service.icon}
                  </span>
                  <span className="services-page-number">
                    {service.number}
                  </span>
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <div className="services-page-features">
                  {service.features.map((feature) => (
                    <span key={feature}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </span>
                  ))}
                </div>

                <Link
                  to="/therapists"
                  className="services-page-link"
                >
                  Explore support →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-light services-process">
        <div className="container">
          <div className="services-process-heading">
            <span className="section-label">GETTING STARTED</span>

            <h2 className="section-heading">
              Your next step can be simple.
            </h2>

            <p className="section-description">
              Getting connected with professional support
              doesn't have to feel complicated.
            </p>
          </div>

          <div className="services-process-grid">
            <div className="services-process-card">
              <span>01</span>
              <h3>Create an account</h3>
              <p>Get started by creating your Unfazed account.</p>
            </div>

            <div className="services-process-card">
              <span>02</span>
              <h3>Explore therapists</h3>
              <p>Discover professionals and explore their profiles.</p>
            </div>

            <div className="services-process-card">
              <span>03</span>
              <h3>Book a session</h3>
              <p>Choose an available appointment that works for you.</p>
            </div>

            <div className="services-process-card">
              <span>04</span>
              <h3>Begin your journey</h3>
              <p>Connect with your therapist and continue at your pace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section services-cta">
        <div className="container services-cta-content">
          <span className="section-label">TAKE THE FIRST STEP</span>

          <h2>
            You deserve a space
            <br />
            to focus on yourself.
          </h2>

          <p>
            Explore your options and connect with professional
            support whenever you're ready.
          </p>

          <Link to="/register" className="btn btn-primary">
            Get Started →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Services;
