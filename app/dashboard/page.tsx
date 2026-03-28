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
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = [...leadMagnets, ...templates].filter((item) => {
        const itemName = item.name.toLowerCase();
        const itemDescription = item.description.toLowerCase();
        return (
          itemName.includes(searchTerm.toLowerCase()) ||
          itemDescription.includes(searchTerm.toLowerCase())
        );
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredResults = () => {
    if (filterType === 'all' && filterStatus === 'all') {
      return searchResults;
    }

    return searchResults.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }

      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }

      return true;
    });
  };

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search lead magnets and templates"
      />
      <select value={filterType} onChange={handleFilterTypeChange}>
        <option value="all">All types</option>
        <option value="leadMagnet">Lead Magnets</option>
        <option value="template">Templates</option>
      </select>
      <select value={filterStatus} onChange={handleFilterStatusChange}>
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      {isSearching ? (
        <p>Searching...</p>
      ) : (
        <div>
          {filteredResults().map((item) => (
            <div key={item.id}>
              {item.type === 'leadMagnet' ? (
                <LeadMagnetCard leadMagnet={item} />
              ) : (
                <TemplateCard template={item} />
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={handleCreateLeadMagnet}>Create Lead Magnet</button>
      <button onClick={handleCreateTemplate}>Create Template</button>
      <AnalyticsCard analytics={analytics} />
      <SettingsCard settings={settings} />
      <PricingCard pricing={pricing} />
    </div>
  );
};

export default DashboardPage;