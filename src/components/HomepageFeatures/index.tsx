import type {ReactNode} from 'react';
import {useRef} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {motion, useInView} from 'framer-motion';
import {HiLightningBolt, HiShieldCheck, HiGlobe, HiChip, HiLockClosed, HiLink} from 'react-icons/hi';
import {SiNodedotjs, SiJavascript, SiInternetcomputer} from 'react-icons/si';
import {FaServer, FaWallet} from 'react-icons/fa';
import styles from './styles.module.css';

type ProductItem = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  link: string;
  highlight?: string;
};

const ProductList: ProductItem[] = [
  {
    title: 'Node.js SDK',
    icon: SiNodedotjs,
    description: 'Full-featured SDK for server-side applications. gRPC connection, event streaming, transaction building, and more.',
    link: '/docs/sdk-js',
    highlight: 'Server-side',
  },
  {
    title: 'Browser SDK',
    icon: SiJavascript,
    description: 'Lightweight SDK for web applications. REST API client, transaction signing, QR codes. ~150KB gzipped.',
    link: '/docs/sdk-web/intro',
    highlight: 'Client-side',
  },
  {
    title: 'Motoko Package',
    icon: SiInternetcomputer,
    description: 'Internet Computer canister SDK. Threshold ECDSA signing, on-chain wallets, cross-chain bridges.',
    link: '/docs/hoosat-mo',
    highlight: 'IC Canisters',
  },
  {
    title: 'REST API',
    icon: FaServer,
    description: 'HTTP API for any programming language. Query blockchain, send transactions, manage addresses.',
    link: '/docs/rest-api/intro',
    highlight: 'Universal',
  },
  {
    title: 'Wallet Extension',
    icon: FaWallet,
    description: 'Browser extension wallet for users. DApp integration, transaction signing, message authentication.',
    link: '/docs/wallet-extension/intro',
    highlight: 'End Users',
  },
];

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Lightning Fast',
    icon: HiLightningBolt,
    description: 'Block time of just 1 second with instant transaction confirmation. Experience the speed of next-generation blockchain technology.',
  },
  {
    title: 'Highly Scalable',
    icon: HiChip,
    description: 'BlockDAG architecture with 1 block per second throughput. Built to handle real-world application demands without congestion.',
  },
  {
    title: 'Minimal Fees',
    icon: HiGlobe,
    description: 'Transaction fees as low as 0.00001 HTN. Perfect for micropayments, DeFi, and high-frequency applications.',
  },
  {
    title: 'Developer Friendly',
    icon: HiShieldCheck,
    description: 'Multiple SDKs (Node.js, Browser), REST API, comprehensive documentation, and working examples. Build faster with better tools.',
  },
  {
    title: 'Secure by Design',
    icon: HiLockClosed,
    description: 'ECDSA secp256k1 signatures, BLAKE3 hashing, and battle-tested cryptographic primitives. Your assets are protected.',
  },
  {
    title: 'UTXO Model',
    icon: HiLink,
    description: 'Bitcoin-like UTXO architecture ensures transparency, parallelization, and efficient state management for scalable dApps.',
  },
];

function Product({title, icon: Icon, description, link, highlight, index}: ProductItem & {index: number}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className={clsx('col col--4 mb-16')} ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        style={{ height: '100%' }}
      >
        <Link to={link} className={styles.productCard}>
          <div className={styles.productIcon}>
            <Icon />
          </div>
          <Heading as="h3">{title}</Heading>
          {highlight && <div className={styles.productHighlight}>{highlight}</div>}
          <p>{description}</p>
          <div className={styles.productLink}>Learn more →</div>
        </Link>
      </motion.div>
    </div>
  );
}

function Feature({title, icon: Icon, description, index}: FeatureItem & {index: number}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className={clsx('col col--4')} ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={styles.featureCard}
      >
        <div className="text--center">
          <div className={styles.featureIcon}>
            <Icon />
          </div>
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  const productsRef = useRef(null);
  const quickStartRef = useRef(null);

  const productsInView = useInView(productsRef, { once: true, margin: "-100px" });
  const quickStartInView = useInView(quickStartRef, { once: true, margin: "-100px" });

  return (
    <>
      {/* Products Section */}
      <section className={styles.products} ref={productsRef}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={productsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text--center margin-bottom--xl"
          >
            <Heading as="h2">
              Choose Your <span className="text-gradient">Tool</span>
            </Heading>
            <p className="hero__subtitle">
              Pick the right tool for your use case - from full-featured SDKs to simple REST APIs
            </p>
          </motion.div>
          <div className="row">
            {ProductList.map((props, idx) => (
              <Product key={idx} {...props} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className={styles.quickStart} ref={quickStartRef}>
        <div className="container">
          <div className="row">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={quickStartInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="col col--6"
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={quickStartInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6 }}
              className="col col--6"
            >
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
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
