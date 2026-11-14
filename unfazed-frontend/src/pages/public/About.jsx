
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      number: "01",
      title: "Empathy First",
      description:
        "We believe every person's experience deserves understanding, compassion and respect.",
    },
    {
      number: "02",
      title: "Privacy Matters",
      description:
        "Your personal information and conversations deserve thoughtful protection and confidentiality.",
    },
    {
      number: "03",
      title: "Professional Support",
      description:
        "We aim to make connecting with qualified mental health professionals simpler.",
    },
    {
      number: "04",
      title: "Your Pace, Your Journey",
      description:
        "Everyone's journey is different. We encourage people to take their next step in their own time.",
    },
  ];

  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="container about-hero-content">
          <span className="section-label">ABOUT UNFAZED</span>

          <h1>
            A space where
            <br />
            <span>your wellbeing</span> comes first.
          </h1>

          <p>
            We are building a more thoughtful way to connect
            with mental health professionals and access
            meaningful support.
          </p>

          <Link to="/services" className="btn btn-primary">
            Explore Our Services →
          </Link>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="section about-story">
        <div className="container about-story-grid">
          <div>
            <span className="section-label">OUR STORY</span>

            <h2 className="section-heading">
              Everyone deserves a space to be heard.
            </h2>
          </div>

          <div className="about-story-text">
            <p>
              Taking care of mental wellbeing should not feel
              complicated. Yet finding the right professional
              support, managing appointments and staying
              connected can sometimes feel overwhelming.
            </p>

            <p>
              Unfazed is designed to bring these experiences
              together in one thoughtful digital platform.
              We connect clients and therapists through tools
              that make the journey more organized and accessible.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="section section-light about-purpose">
        <div className="container about-purpose-grid">
          <div className="purpose-card">
            <span className="section-label">OUR MISSION</span>
            <h2>Making support easier to access.</h2>
            <p>
              Our mission is to simplify the process of finding
              professional mental health support and managing
              the journey with greater convenience.
            </p>
          </div>

          <div className="purpose-card purpose-card-dark">
            <span className="section-label">OUR VISION</span>
            <h2>A more connected approach to wellbeing.</h2>
            <p>
              We envision a world where people can access
              thoughtful support and professionals can focus
              more on the people they care for.
            </p>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="section about-values">
        <div className="container">
          <div className="about-values-heading">
            <span className="section-label">WHAT GUIDES US</span>
            <h2 className="section-heading">
              The values behind Unfazed.
            </h2>
            <p className="section-description">
              The principles that shape how we build our platform
              and the experience we want to create.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((value) => (
              <article className="about-value-card" key={value.number}>
                <span>{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section about-cta">
        <div className="container about-cta-content">
          <span className="section-label">YOUR JOURNEY STARTS HERE</span>

          <h2>
            Take your next step,
            <br />
            whenever you're ready.
          </h2>

          <p>
            Explore the platform and discover a more thoughtful
            way to connect with professional support.
          </p>

          <Link to="/register" className="btn btn-primary">
            Get Started →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
