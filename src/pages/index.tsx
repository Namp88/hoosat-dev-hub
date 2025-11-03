import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import {motion} from 'framer-motion';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    // Detect mobile
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    mobileQuery.addEventListener('change', handleMobileChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      mobileQuery.removeEventListener('change', handleMobileChange);
    };
  }, []);

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      {/* Animated Background Elements - matching landing page exactly */}
      <div className={styles.backgroundOrbs}>
        {/* Gradient Orbs - Simplified for mobile */}
        {!isMobile && (
          <>
            <motion.div
              animate={prefersReducedMotion ? {} : {
                y: [0, -50, 0],
                x: [0, 30, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={styles.orb1}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : {
                y: [0, 40, 0],
                x: [0, -30, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 1 }}
              className={styles.orb2}
            />
          </>
        )}

        {/* Mobile: static gradient */}
        {isMobile && (
          <div className={styles.mobileGradient} />
        )}

        {/* Subtle Grid Pattern */}
        <div className={styles.gridPattern} />

        {/* Floating Particles - Reduced for mobile */}
        {!prefersReducedMotion && [...Array(isMobile ? 3 : 6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5,
            }}
            className={styles.particle}
            style={{
              left: `${15 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="container" style={{position: 'relative', zIndex: 10}}>
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading as="h1" className={styles.heroTitle}>
            Build on <span className="text-gradient">Hoosat Network</span>
          </Heading>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={styles.heroSubtitle}
        >
          Fast, scalable, developer-friendly blockchain platform with comprehensive SDKs, REST API,
          and wallet extension. Build decentralized applications with ease.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={styles.buttons}
        >
          <Link
            className="button button--primary button--lg"
            to="/docs/quick-start">
            Get Started →
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            View Documentation
          </Link>
        </motion.div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Hoosat Developer Hub"
      description="Build decentralized applications on Hoosat blockchain with comprehensive SDKs, REST API, and wallet extension">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
