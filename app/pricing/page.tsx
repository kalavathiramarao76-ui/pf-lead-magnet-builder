use client;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingPlan } from '../types';
import Layout from '../layout';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import PricingTable from '../components/PricingTable';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 9.99,
    features: ['Lead Magnet Templates', 'Analytics and Tracking', 'Customizable Landing Pages'],
  },
  {
    name: 'Pro',
    price: 29.99,
    features: [
      'Lead Magnet Templates',
      'Analytics and Tracking',
      'Customizable Landing Pages',
      'A/B Testing',
      'Integration with Email Marketing Tools',
    ],
  },
  {
    name: 'Business',
    price: 49.99,
    features: [
      'Lead Magnet Templates',
      'Analytics and Tracking',
      'Customizable Landing Pages',
      'A/B Testing',
      'Integration with Email Marketing Tools',
      'Collaboration Features',
    ],
  },
];

const Page = () => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const router = useRouter();

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
  };

  return (
    <Layout>
      <Hero
        title="Lead Magnet Builder"
        subtitle="Create and optimize lead magnets to capture and convert leads"
        gradient="bg-gradient-to-r from-blue-500 to-purple-500"
      />
      <FeatureGrid
        features={[
          'Lead Magnet Templates',
          'Analytics and Tracking',
          'A/B Testing',
          'Customizable Landing Pages',
          'Integration with Email Marketing Tools',
          'Collaboration Features',
        ]}
      />
      <PricingTable plans={pricingPlans} selectedPlan={selectedPlan} onPlanSelect={handlePlanSelect} />
      <FAQ
        questions={[
          {
            question: 'What is a lead magnet?',
            answer: 'A lead magnet is a valuable resource or offer that captures and converts leads.',
          },
          {
            question: 'How do I create a lead magnet?',
            answer: 'You can create a lead magnet using our templates and customization options.',
          },
          {
            question: 'Can I integrate Lead Magnet Builder with my email marketing tool?',
            answer: 'Yes, we support integration with popular email marketing tools.',
          },
        ]}
      />
      <Footer
        copyright="2024 Lead Magnet Builder"
        links={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lead Magnet Library', href: '/lead-magnet-library' },
          { label: 'Template Gallery', href: '/template-gallery' },
          { label: 'Analytics Dashboard', href: '/analytics-dashboard' },
          { label: 'Settings', href: '/settings' },
        ]}
      />
    </Layout>
  );
};

export default Page;