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
  const [searchResults, setSearchResults] = useState([]);

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

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    const results = [...leadMagnets, ...templates].filter((item) => {
      const itemName = item.name.toLowerCase();
      const itemDescription = item.description.toLowerCase();
      return (
        itemName.includes(searchTerm.toLowerCase()) ||
        itemDescription.includes(searchTerm.toLowerCase())
      );
    });
    setSearchResults(results);
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
      <h1 className="text-3xl font-bold mb-4">Lead Magnet Builder</h1>
      <div className="flex justify-between mb-4">
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search lead magnets and templates"
          className="w-full p-2 pl-10 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"
        />
        <button
          className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateLeadMagnet}
        >
          Create Lead Magnet
        </button>
        <button
          className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateTemplate}
        >
          Create Template
        </button>
      </div>
      {searchTerm ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          {searchResults.map((result) => (
            <div key={result.id}>
              {result.name.includes('Lead Magnet') ? (
                <LeadMagnetCard leadMagnet={result} />
              ) : (
                <TemplateCard template={result} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Lead Magnets</h2>
          {filteredLeadMagnets.map((leadMagnet) => (
            <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
          ))}
          <h2 className="text-2xl font-bold mt-8 mb-4">Templates</h2>
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
          <h2 className="text-2xl font-bold mt-8 mb-4">Analytics</h2>
          <AnalyticsCard analytics={analytics} />
          <h2 className="text-2xl font-bold mt-8 mb-4">Settings</h2>
          <SettingsCard settings={settings} />
          <h2 className="text-2xl font-bold mt-8 mb-4">Pricing</h2>
          <PricingCard pricing={pricing} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;