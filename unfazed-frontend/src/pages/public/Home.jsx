
import { Link } from "react-router-dom";

const supportAreas = [
  {
    number: "01",
    icon: "♡",
    title: "Feeling overwhelmed?",
    description:
      "When everything feels like too much, find space to slow down, reflect and understand what you're experiencing.",
    link: "Explore emotional wellbeing",
  },
  {
    number: "02",
    icon: "↗",
    title: "Navigating relationships?",
    description:
      "Explore communication, boundaries and the patterns that shape your relationships.",
    link: "Explore relationship support",
  },
  {
    number: "03",
    icon: "✧",
    title: "Looking for clarity?",
    description:
      "Make room for self-discovery, personal growth and a better understanding of yourself.",
    link: "Explore self-discovery",
  },
  {
    number: "04",
    icon: "☁",
    title: "Simply need someone to listen?",
    description:
      "Sometimes having a respectful space to express yourself can be a meaningful first step.",
    link: "Find someone to talk to",
  },
];

const services = [
  {
    category: "INDIVIDUAL CARE",
    title: "Individual Therapy",
    description:
      "A dedicated space to explore personal challenges, emotions and life experiences.",
  },
  {
    category: "RELATIONSHIPS",
    title: "Relationship Counselling",
    description:
      "Work towards healthier communication, mutual understanding and stronger connections.",
  },
  {
    category: "PERSONAL GROWTH",
    title: "Self-Discovery",
    description:
      "Understand your thoughts, recognise patterns and develop a stronger sense of self.",
  },
  {
    category: "STRESS & WELLBEING",
    title: "Emotional Wellbeing",
    description:
      "Explore ways to understand everyday stress and build healthier coping habits.",
  },
  {
    category: "YOUNG ADULTS",
    title: "Student Support",
    description:
      "Navigate academic pressure, transitions, relationships and the uncertainties of growing up.",
  },
  {
    category: "WORK & LIFE",
    title: "Professional Wellbeing",
    description:
      "Explore work-related stress, boundaries, motivation and personal balance.",
  },
];

const steps = [
  {
    number: "01",
    title: "Take the first step",
    description:
      "Explore the platform and discover the kind of support you are looking for.",
  },
  {
    number: "02",
    title: "Find your therapist",
    description:
      "Explore therapist profiles, qualifications and areas of specialization.",
  },
  {
    number: "03",
    title: "Choose your session",
    description:
      "Review available appointment times and choose what works for you.",
  },
  {
    number: "04",
    title: "Continue your journey",
    description:
      "Stay connected through your client portal and manage your appointments.",
  },
];

const faqs = [
  {
    question: "How do I get started with Unfazed?",
    answer:
      "You can begin by creating an account, exploring available therapists and reviewing their profiles.",
  },
  {
    question: "Can I choose my own therapist?",
    answer:
      "Yes. Unfazed is designed to let clients explore therapists and choose whom they would like to connect with.",
  },
  {
    question: "Can I manage my appointments online?",
    answer:
      "The client portal is designed to help clients view and manage their therapy appointments.",
  },
  {
    question: "Is my personal information protected?",
    answer:
      "We take privacy seriously. Personal information and therapy-related details should only be accessed by authorized users in accordance with the platform's privacy practices.",
  },
];

const Home = () => {
  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="container hero-container">

          <div className="hero-content">
            <span className="hero-eyebrow">
              A SAFE SPACE TO BE YOURSELF
            </span>

            <h1>
              Your feelings deserve a space to be{" "}
              <span>understood.</span>
            </h1>

            <p>
              Life can feel overwhelming sometimes. You don't
              have to figure everything out alone. Take a moment,
              find your voice and explore support at your own pace.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-light">
                Start Your Journey →
              </Link>

              <Link to="/therapists" className="btn btn-outline">
                Meet Our Therapists
              </Link>
            </div>

            <div className="hero-note">
              <span>♡</span>
              A little understanding can make a meaningful difference.
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-placeholder">
              <span className="hero-image-symbol">✧</span>
              <p>A moment for yourself.</p>
              <span>YOUR JOURNEY, YOUR PACE</span>
            </div>

            <div className="hero-floating-card">
              <span>✦ A GENTLE REMINDER</span>
              <p>You don't have to have everything figured out today.</p>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="container trust-grid">
          <div>◇ Thoughtful Support</div>
          <div>♡ Your Choice Matters</div>
          <div>⌘ A Connected Experience</div>
          <div>✧ Support At Your Pace</div>
        </div>
      </section>

      {/* SUPPORT AREAS */}
      <section className="section section-light" id="support">
        <div className="container">

          <span className="section-label">WE HEAR YOU</span>

          <h2 className="section-heading">
            Whatever you're carrying, you don't have to carry it alone.
          </h2>

          <p className="section-description">
            Everyone's experience is different. Start wherever
            you are. There's no perfect way to begin.
          </p>

          <div className="support-grid">
            {supportAreas.map((area) => (
              <article className="support-card" key={area.number}>
                <span className="support-icon">{area.icon}</span>

                <span className="card-number">{area.number}</span>

                <h3>{area.title}</h3>

                <p>{area.description}</p>

                <Link to="/therapists" className="text-link">
                  {area.link} →
                </Link>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="section about-section" id="about">
        <div className="container about-grid">

          <div className="about-visual">
            <div className="about-visual-inner">
              <span>UNFAZED</span>
              <h3>
                A little more understanding.
                A little less judgment.
              </h3>
              <p>
                A space where your story deserves to be heard.
              </p>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">WHO WE ARE</span>

            <h2 className="section-heading">
              Mental wellbeing deserves understanding, not judgment.
            </h2>

            <p>
              Unfazed is designed to bring clients and therapists
              together through a thoughtful digital experience.
            </p>

            <p>
              From discovering therapists to managing appointments,
              our goal is to make the process of accessing support
              simpler and more convenient.
            </p>

            <Link to="/about" className="text-link">
              Discover Our Approach →
            </Link>
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="container">

          <div className="section-top">
            <div>
              <span className="section-label">
                EXPLORE YOUR OPTIONS
              </span>

              <h2 className="section-heading">
                Support for every part of your journey.
              </h2>

              <p className="section-description">
                Explore different areas of support and find
                what feels relevant to your experiences.
              </p>
            </div>

            <Link to="/services" className="btn btn-primary">
              Explore Services →
            </Link>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <div className="service-card-top">
                  <span>{service.category}</span>
                  <span>0{index + 1}</span>
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <Link to="/services" className="text-link">
                  Learn More →
                </Link>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* THERAPIST DISCOVERY */}
      <section className="section section-light" id="therapists">
        <div className="container therapist-discovery">

          <div>
            <span className="section-label">YOUR SUPPORT MATTERS</span>

            <h2 className="section-heading">
              The right conversation can be a meaningful beginning.
            </h2>

            <p className="section-description">
              Explore therapist profiles, learn about their
              qualifications and specializations, and choose
              someone you feel comfortable connecting with.
            </p>

            <Link to="/therapists" className="btn btn-primary">
              Discover Therapists →
            </Link>
          </div>

          <div className="therapist-feature-card">
            <span className="feature-icon">✧</span>
            <h3>Find a connection that feels right.</h3>
            <p>
              Your choice matters. Take time to explore your
              options and find a professional whose approach
              aligns with your needs.
            </p>
            <Link to="/therapists" className="text-link">
              Explore therapist profiles →
            </Link>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="container">

          <div className="center-heading">
            <span className="section-label">HOW IT UNFOLDS</span>

            <h2 className="section-heading">
              Your journey. Your pace. Our support.
            </h2>

            <p className="section-description">
              A simple experience from your first visit
              to your ongoing appointments.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* PRIVACY AND VALUES */}
      <section className="section section-light" id="our-values">
        <div className="container values-grid">

          <div>
            <span className="section-label">WHAT MATTERS TO US</span>

            <h2 className="section-heading">
              Because feeling understood matters.
            </h2>

            <p className="section-description">
              A supportive experience begins with respect,
              thoughtful communication and clear boundaries.
            </p>
          </div>

          <div className="values-list">
            <article>
              <span>01</span>
              <div>
                <h3>Respect for your privacy</h3>
                <p>Your personal information deserves careful handling.</p>
              </div>
            </article>

            <article>
              <span>02</span>
              <div>
                <h3>Professional connections</h3>
                <p>Explore therapist qualifications and areas of expertise.</p>
              </div>
            </article>

            <article>
              <span>03</span>
              <div>
                <h3>Your journey, your choice</h3>
                <p>Take time to make decisions that feel right for you.</p>
              </div>
            </article>

            <article>
              <span>04</span>
              <div>
                <h3>A simpler experience</h3>
                <p>Keep your appointments and connections organized in one place.</p>
              </div>
            </article>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container faq-container">

          <div>
            <span className="section-label">GOOD TO KNOW</span>

            <h2 className="section-heading">
              A few things you might be wondering.
            </h2>

            <p className="section-description">
              Have more questions? Our team would be happy
              to help you understand the platform.
            </p>

            <Link to="/contact" className="text-link">
              Contact Us →
            </Link>
          </div>

          <div className="faq-list">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section final-cta-section">
        <div className="container">
          <div className="final-cta">
            <span className="section-label">
              A GENTLE NEXT STEP
            </span>

            <h2>
              You don't need to have everything figured out to begin.
            </h2>

            <p>
              Whenever you're ready, take a moment to explore
              your options. Your next step can be a small one.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-light">
                Begin Your Journey →
              </Link>

              <Link to="/contact" className="btn btn-outline">
                Talk To Our Team
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
