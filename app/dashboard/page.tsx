import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LeadMagnetCard } from '../components/LeadMagnetCard';
import { TemplateCard } from '../components/TemplateCard';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { SettingsCard } from '../components/SettingsCard';
import { PricingCard } from '../components/PricingCard';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DashboardPage = () => {
  const pathname = usePathname();
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [settings, setSettings] = useState({});
  const [pricing, setPricing] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const { getItem, setItem } = useLocalStorage();

  useEffect(() => {
    const storedLeadMagnets = getItem('leadMagnets');
    const storedTemplates = getItem('templates');
    const storedAnalytics = getItem('analytics');
    const storedSettings = getItem('settings');
    const storedPricing = getItem('pricing');

    if (storedLeadMagnets) {
      setLeadMagnets(JSON.parse(storedLeadMagnets));
    }

    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }

    if (storedAnalytics) {
      setAnalytics(JSON.parse(storedAnalytics));
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }

    if (storedPricing) {
      setPricing(JSON.parse(storedPricing));
    }
  }, []);

  const handleCreateLeadMagnet = () => {
    const newLeadMagnet = {
      id: Date.now(),
      name: 'New Lead Magnet',
      description: 'This is a new lead magnet',
    };

    setLeadMagnets((prevLeadMagnets) => [...prevLeadMagnets, newLeadMagnet]);
    setItem('leadMagnets', JSON.stringify([...leadMagnets, newLeadMagnet]));
  };

  const handleCreateTemplate = () => {
    const newTemplate = {
      id: Date.now(),
      name: 'New Template',
      description: 'This is a new template',
    };

    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    setItem('templates', JSON.stringify([...templates, newTemplate]));
  };

  const filteredLeadMagnets = leadMagnets.filter((leadMagnet) => {
    const leadMagnetName = leadMagnet.name.toLowerCase();
    const leadMagnetDescription = leadMagnet.description.toLowerCase();
    return (
      leadMagnetName.includes(searchTerm.toLowerCase()) ||
      leadMagnetDescription.includes(searchTerm.toLowerCase())
    );
  });

  const filteredTemplates = templates.filter((template) => {
    const templateName = template.name.toLowerCase();
    const templateDescription = template.description.toLowerCase();
    return (
      templateName.includes(searchTerm.toLowerCase()) ||
      templateDescription.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search lead magnets and templates"
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <LeadMagnetCard
          title="Lead Magnets"
          count={filteredLeadMagnets.length}
          onCreate={handleCreateLeadMagnet}
        />
        <TemplateCard
          title="Templates"
          count={filteredTemplates.length}
          onCreate={handleCreateTemplate}
        />
        <AnalyticsCard title="Analytics" data={analytics} />
        <SettingsCard title="Settings" data={settings} />
        <PricingCard title="Pricing" data={pricing} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredLeadMagnets.map((leadMagnet) => (
          <div key={leadMagnet.id}>
            <h2 className="text-xl font-bold">{leadMagnet.name}</h2>
            <p>{leadMagnet.description}</p>
          </div>
        ))}
        {filteredTemplates.map((template) => (
          <div key={template.id}>
            <h2 className="text-xl font-bold">{template.name}</h2>
            <p>{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;