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
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('name');
  const [leadMagnetFilter, setLeadMagnetFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');

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
        return itemName.includes(searchTerm.toLowerCase()) || itemDescription.includes(searchTerm.toLowerCase());
      });
      setSearchResults(results);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterLeadMagnet = (filter) => {
    setLeadMagnetFilter(filter);
  };

  const handleFilterTemplate = (filter) => {
    setTemplateFilter(filter);
  };

  const filteredLeadMagnets = leadMagnets.filter((leadMagnet) => {
    if (leadMagnetFilter === 'all') {
      return true;
    } else if (leadMagnetFilter === 'active') {
      return leadMagnet.status === 'active';
    } else if (leadMagnetFilter === 'inactive') {
      return leadMagnet.status === 'inactive';
    }
  });

  const filteredTemplates = templates.filter((template) => {
    if (templateFilter === 'all') {
      return true;
    } else if (templateFilter === 'active') {
      return template.status === 'active';
    } else if (templateFilter === 'inactive') {
      return template.status === 'inactive';
    }
  });

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search lead magnets and templates"
      />
      <select value={leadMagnetFilter} onChange={(e) => handleFilterLeadMagnet(e.target.value)}>
        <option value="all">All Lead Magnets</option>
        <option value="active">Active Lead Magnets</option>
        <option value="inactive">Inactive Lead Magnets</option>
      </select>
      <select value={templateFilter} onChange={(e) => handleFilterTemplate(e.target.value)}>
        <option value="all">All Templates</option>
        <option value="active">Active Templates</option>
        <option value="inactive">Inactive Templates</option>
      </select>
      {isSearching ? (
        <div>
          {searchResults.map((result) => (
            <div key={result.id}>
              <h2>{result.name}</h2>
              <p>{result.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {filteredLeadMagnets.map((leadMagnet) => (
            <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
          ))}
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
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