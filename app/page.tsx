use client;

import { useState } from 'react';
import Link from 'next/link';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { FaCheck } from 'react-icons/fa';
import { RiQuestionLine } from 'react-icons/ri';

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <Hero />
      <Features />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-12 md:p-24 lg:p-36">
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold">Lead Magnet Builder</h1>
      <p className="text-lg md:text-2xl lg:text-3xl">Create and optimize lead magnets to capture and convert leads.</p>
      <Link href="/dashboard" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
        Get Started
      </Link>
    </section>
  );
}

function Features() {
  return (
    <section className="p-12 md:p-24 lg:p-36">
      <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <FeatureCard
          title="Lead Magnet Templates"
          description="Choose from a variety of pre-designed templates to get started."
          icon={<FaCheck />}
        />
        <FeatureCard
          title="Analytics and Tracking"
          description="Monitor your lead magnet's performance and adjust your strategy."
          icon={<FaCheck />}
        />
        <FeatureCard
          title="A/B Testing"
          description="Test different variations to maximize your conversion rates."
          icon={<FaCheck />}
        />
        <FeatureCard
          title="Customizable Landing Pages"
          description="Create a unique landing page that reflects your brand."
          icon={<FaCheck />}
        />
        <FeatureCard
          title="Integration with Email Marketing Tools"
          description="Seamlessly integrate with popular email marketing tools."
          icon={<FaCheck />}
        />
        <FeatureCard
          title="Collaboration Features"
          description="Work with your team to create and manage lead magnets."
          icon={<FaCheck />}
        />
      </div>
    </section>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded shadow-md">
      <h3 className="text-lg md:text-2xl lg:text-3xl font-bold">{title}</h3>
      <p className="text-sm md:text-base lg:text-lg">{description}</p>
      {icon}
    </div>
  );
}

function Pricing() {
  return (
    <section className="p-12 md:p-24 lg:p-36">
      <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <PricingCard
          title="Basic"
          price="$9.99"
          features={['Lead Magnet Templates', 'Analytics and Tracking']}
        />
        <PricingCard
          title="Pro"
          price="$19.99"
          features={['Lead Magnet Templates', 'Analytics and Tracking', 'A/B Testing', 'Customizable Landing Pages']}
        />
        <PricingCard
          title="Enterprise"
          price="$49.99"
          features={[
            'Lead Magnet Templates',
            'Analytics and Tracking',
            'A/B Testing',
            'Customizable Landing Pages',
            'Integration with Email Marketing Tools',
            'Collaboration Features',
          ]}
        />
      </div>
    </section>
  );
}

function PricingCard({ title, price, features }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded shadow-md">
      <h3 className="text-lg md:text-2xl lg:text-3xl font-bold">{title}</h3>
      <p className="text-sm md:text-base lg:text-lg">{price}</p>
      <ul>
        {features.map((feature) => (
          <li key={feature} className="text-sm md:text-base lg:text-lg">
            <FaCheck /> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faq() {
  return (
    <section className="p-12 md:p-24 lg:p-36">
      <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold">Frequently Asked Questions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <FaqCard
          question="What is a lead magnet?"
          answer="A lead magnet is a free resource or incentive that is offered to potential customers in exchange for their contact information."
        />
        <FaqCard
          question="How do I create a lead magnet?"
          answer="You can create a lead magnet using our templates and customization options. Simply choose a template, add your content, and customize the design."
        />
        <FaqCard
          question="Can I integrate Lead Magnet Builder with my email marketing tool?"
          answer="Yes, Lead Magnet Builder integrates with popular email marketing tools, allowing you to seamlessly add new leads to your email list."
        />
      </div>
    </section>
  );
}

function FaqCard({ question, answer }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded shadow-md">
      <h3 className="text-lg md:text-2xl lg:text-3xl font-bold">{question}</h3>
      <p className="text-sm md:text-base lg:text-lg">{answer}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 p-4 md:p-6 lg:p-8 text-center">
      <p>&copy; 2024 Lead Magnet Builder</p>
      <ul className="flex justify-center">
        <li className="mr-4">
          <Link href="/terms">Terms of Service</Link>
        </li>
        <li className="mr-4">
          <Link href="/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/contact">Contact Us</Link>
        </li>
      </ul>
    </footer>
  );
}