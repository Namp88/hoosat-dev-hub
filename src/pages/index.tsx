import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Build on Hoosat Blockchain
        </Heading>
        <p className="hero__subtitle">Fast, scalable, developer-friendly blockchain platform with comprehensive SDKs and tools</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/quick-start">
            Get Started →
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/"
            style={{marginLeft: '1rem'}}>
            View Documentation
          </Link>
        </div>
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
