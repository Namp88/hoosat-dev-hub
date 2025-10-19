import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type ProductItem = {
  title: string;
  icon: string;
  description: string;
  link: string;
  highlight?: string;
};

const ProductList: ProductItem[] = [
  {
    title: 'Node.js SDK',
    icon: '🚀',
    description: 'Full-featured SDK for server-side applications. gRPC connection, event streaming, transaction building, and more.',
    link: '/docs/sdk-js',
    highlight: 'Server-side',
  },
  {
    title: 'Browser SDK',
    icon: '🌐',
    description: 'Lightweight SDK for web applications. REST API client, transaction signing, QR codes. ~150KB gzipped.',
    link: '/docs/sdk-web/intro',
    highlight: 'Client-side',
  },
  {
    title: 'Motoko Package',
    icon: '🔷',
    description: 'Internet Computer canister SDK. Threshold ECDSA signing, on-chain wallets, cross-chain bridges.',
    link: '/docs/hoosat-mo',
    highlight: 'IC Canisters',
  },
  {
    title: 'REST API',
    icon: '⚡',
    description: 'HTTP API for any programming language. Query blockchain, send transactions, manage addresses.',
    link: '/docs/rest-api/intro',
    highlight: 'Universal',
  },
  {
    title: 'Wallet Extension',
    icon: '🦊',
    description: 'Browser extension wallet for users. DApp integration, transaction signing, message authentication.',
    link: '/docs/wallet-extension/intro',
    highlight: 'End Users',
  },
];

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Lightning Fast',
    icon: '⚡',
    description: 'Block time of just 1 second with instant transaction confirmation. Experience the speed of next-generation blockchain technology.',
  },
  {
    title: 'Highly Scalable',
    icon: '📈',
    description: 'BlockDAG architecture with 10 blocks per second throughput. Built to handle real-world application demands without congestion.',
  },
  {
    title: 'Minimal Fees',
    icon: '💎',
    description: 'Transaction fees as low as 0.00001 HTN. Perfect for micropayments, DeFi, and high-frequency applications.',
  },
  {
    title: 'Developer Friendly',
    icon: '💻',
    description: 'Multiple SDKs (Node.js, Browser), REST API, comprehensive documentation, and working examples. Build faster with better tools.',
  },
  {
    title: 'Secure by Design',
    icon: '🔒',
    description: 'ECDSA secp256k1 signatures, BLAKE3 hashing, and battle-tested cryptographic primitives. Your assets are protected.',
  },
  {
    title: 'UTXO Model',
    icon: '🔗',
    description: 'Bitcoin-like UTXO architecture ensures transparency, parallelization, and efficient state management for scalable dApps.',
  },
];

function Product({title, icon, description, link, highlight}: ProductItem) {
  return (
    <div className={clsx('col col--4 mb-16')}>
      <Link to={link} className={styles.productCard}>
        <div className={styles.productIcon}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        {highlight && <div className={styles.productHighlight}>{highlight}</div>}
        <p>{description}</p>
        <div className={styles.productLink}>Learn more →</div>
      </Link>
    </div>
  );
}

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className="text--center">
          <div className={styles.featureIcon}>{icon}</div>
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <>
      {/* Products Section */}
      <section className={styles.products}>
        <div className="container">
          <div className="text--center margin-bottom--xl">
            <Heading as="h2">Choose Your Tool</Heading>
            <p className="hero__subtitle">
              Pick the right tool for your use case - from full-featured SDKs to simple REST APIs
            </p>
          </div>
          <div className="row">
            {ProductList.map((props, idx) => (
              <Product key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <div className="text--center margin-bottom--xl">
            <Heading as="h2">Why Hoosat Network?</Heading>
          </div>
          <div className="row">
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className={styles.quickStart}>
        <div className="container">
          <div className="row">
            <div className="col col--6">
              <Heading as="h2">Quick Start</Heading>
              <p>Get started with Hoosat in minutes:</p>
              <ol>
                <li>Choose your SDK or tool</li>
                <li>Follow the installation guide</li>
                <li>Copy the examples</li>
                <li>Start building!</li>
              </ol>
              <div className={styles.buttons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/quick-start">
                  Get Started →
                </Link>
              </div>
            </div>
            <div className="col col--6">
              <div className={styles.codeExample}>
                <pre>
                  <code>{`// Node.js SDK
import { HoosatClient } from 'hoosat-sdk';

const client = new HoosatClient({
  host: 'localhost',
  port: 42420
});

// Send transaction
const txId = await client.sendTransaction({
  to: 'hoosat:qp...',
  amount: 100000000 // 1 HTN
});

console.log('TX ID:', txId);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
