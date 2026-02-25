import { FiCheckCircle, FiActivity, FiUsers, FiAward, FiBarChart2 } from 'react-icons/fi';
import Navbar from '../../components/Home/HomeNavbar';
import Footer from '../../components/Home/Footer';
import { CSSProperties, useState } from 'react';
import AuthModal from '../../components/Home/AuthModal';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const styles: {
    container: CSSProperties;
    heroSection: CSSProperties;
    heroTitle: CSSProperties;
    heroHighlight: CSSProperties;
    heroSubtitle: CSSProperties;
    section: CSSProperties;
    sectionDark: CSSProperties;
    sectionLight: CSSProperties;
    sectionTitle: CSSProperties;
    featuresGrid: CSSProperties;
    featureCard: CSSProperties;
    featureIcon: CSSProperties;
    featureTitle: CSSProperties;
    featureText: CSSProperties;
    ctaSection: CSSProperties;
    ctaTitle: CSSProperties;
    ctaText: CSSProperties;
    ctaButton: CSSProperties;
    testimonialCard: CSSProperties;
    testimonialText: CSSProperties;
    testimonialAuthor: CSSProperties;
    statsContainer: CSSProperties;
    statItem: CSSProperties;
    statNumber: CSSProperties;
    statLabel: CSSProperties;
  } = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0',
      backgroundColor: '#ffffff',
      color: '#344E41',
      fontFamily: '"ABeeZee", sans-serif'
    },
    heroSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3rem',
      padding: '5rem 2rem',
      background: 'linear-gradient(135deg, #DAD7CD 0%, #A3B18A 100%)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
      color: '#344E41',
      marginBottom: '1.5rem',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '2px',
      textTransform: 'uppercase'
    },
    heroHighlight: { color: '#D65A31' },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#3A5A40',
      marginBottom: '2.5rem',
      maxWidth: '700px'
    },
    section: { padding: '6rem 0', position: 'relative' },
    sectionDark: { backgroundColor: '#344E41', color: '#DAD7CD' },
    sectionLight: { backgroundColor: '#DAD7CD', color: '#344E41' },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 400,
      textAlign: 'center',
      marginBottom: '3rem',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '2px',
      textTransform: 'uppercase'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem'
    },
    featureCard: {
      backgroundColor: 'white',
      padding: '2.5rem 2rem',
      borderRadius: '1rem',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    featureIcon: { fontSize: '3rem', marginBottom: '1.5rem', color: '#D65A31' },
    featureTitle: { fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem', color: '#344E41' },
    featureText: { color: '#588157', lineHeight: '1.7' },
    ctaSection: {
      background: 'linear-gradient(135deg, #D65A31 0%, #D9A600 100%)',
      color: 'white',
      padding: '5rem 2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    ctaTitle: {
      fontSize: '2.8rem',
      marginBottom: '1.5rem',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '2px'
    },
    ctaText: {
      fontSize: '1.2rem',
      maxWidth: '700px',
      margin: '0 auto 2.5rem',
      opacity: 0.9
    },
    ctaButton: {
      backgroundColor: '#344E41',
      color: 'white',
      border: 'none',
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: 500,
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: '"ABeeZee", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    },
    testimonialCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '2rem',
      borderRadius: '1rem',
      maxWidth: '800px',
      margin: '0 auto',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    },
    testimonialText: {
      fontSize: '1.1rem',
      fontStyle: 'italic',
      marginBottom: '1.5rem',
      color: '#344E41'
    },
    testimonialAuthor: { fontWeight: 500, color: '#D65A31' },
    statsContainer: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '3rem',
      marginTop: '3rem'
    },
    statItem: { textAlign: 'center' },
    statNumber: {
      fontSize: '3rem',
      fontWeight: 500,
      color: '#D65A31',
      fontFamily: '"Bebas Neue", sans-serif',
      marginBottom: '0.5rem'
    },
    statLabel: { fontSize: '1.1rem', color: '#588157' }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <h1 style={styles.heroTitle}>
            TRANSFORM YOUR BODY <span style={styles.heroHighlight}>WITH APPFIT</span>
          </h1>
          <p style={styles.heroSubtitle}>
            The all-in-one platform for personal trainers and clients. Create custom workout
            routines, track progress, and reach your fitness goals effectively.
          </p>
        </section>

        {/* Features Section */}
        <section style={{ ...styles.section, ...styles.sectionLight }}>
          <h2 style={styles.sectionTitle}>Our Features</h2>
          <div style={styles.featuresGrid}>
            {[
              {
                icon: <FiCheckCircle style={styles.featureIcon} />,
                title: 'Custom Routines',
                text: 'Expert-designed programmes tailored to your fitness goals and experience level.'
              },
              {
                icon: <FiActivity style={styles.featureIcon} />,
                title: 'Advanced Tracking',
                text: 'Monitor your progress with detailed charts and real-time statistics.'
              },
              {
                icon: <FiUsers style={styles.featureIcon} />,
                title: 'Active Community',
                text: 'Connect with certified trainers and members to share experiences.'
              },
              {
                icon: <FiAward style={styles.featureIcon} />,
                title: 'Motivational Challenges',
                text: 'Take part in weekly challenges to keep your motivation and discipline strong.'
              },
              {
                icon: <FiBarChart2 style={styles.featureIcon} />,
                title: 'Nutrition Analysis',
                text: 'Log your diet and receive personalised nutritional recommendations.'
              }
            ].map((feature, index) => (
              <div key={index} style={styles.featureCard as CSSProperties}>
                {feature.icon}
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ ...styles.section, ...styles.sectionDark }}>
          <h2 style={styles.sectionTitle}>Our Impact</h2>
          <div style={styles.statsContainer}>
            {[
              { number: '10K+', label: 'Active users' },
              { number: '95%', label: 'Satisfaction rate' },
              { number: '50+', label: 'Certified trainers' },
              { number: '1M+', label: 'Workouts completed' }
            ].map((stat, index) => (
              <div key={index} style={styles.statItem}>
                <div style={styles.statNumber}>{stat.number}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={{ ...styles.section, ...styles.sectionLight }}>
          <h2 style={styles.sectionTitle}>Success Stories</h2>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>
              "APPFIT completely changed my approach to fitness. In just 3 months I achieved
<<<<<<< HEAD
              results I hadn't managed in years of conventional training.
              The personalized routines and detailed tracking make all the difference."
            </p>
            <p style={styles.testimonialAuthor}>- Carlos M., Lost 12kg</p>
=======
              results I hadn't managed in years of conventional training. The personalised
              routines and detailed tracking make all the difference."
            </p>
            <p style={styles.testimonialAuthor}>— Carlos M., lost 12 kg</p>
>>>>>>> 7cbf2362dc83dd119d6ad13f09bc2cdb03a26e2b
          </div>
        </section>

        {/* CTA Section */}
        <section style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>READY TO TRANSFORM YOUR LIFE?</h2>
          <p style={styles.ctaText}>
<<<<<<< HEAD
            Join thousands of people already achieving their fitness goals with our platform.
            Get immediate access to all features with our 7-day free trial.
=======
            Join thousands of people already reaching their fitness goals with our platform.
            Get instant access to all features with our free 7-day trial.
>>>>>>> 7cbf2362dc83dd119d6ad13f09bc2cdb03a26e2b
          </p>
          <button
            style={styles.ctaButton}
            onClick={() => setIsModalOpen(true)}
<<<<<<< HEAD
            aria-label="Open user menu">
=======
            aria-label="Open sign-in menu"
          >
>>>>>>> 7cbf2362dc83dd119d6ad13f09bc2cdb03a26e2b
            Get Started
          </button>
          <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
      </div>
      <Footer />
    </>
  );
}
