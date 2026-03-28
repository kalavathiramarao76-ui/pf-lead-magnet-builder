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

      const filteredResults = results.filter((item) => {
        if (filterType === 'all') return true;
        if (filterType === 'leadMagnet' && item.id >= 0) return true;
        if (filterType === 'template' && item.id >= 0) return true;
        return false;
      });

      const sortedResults = filteredResults.sort((a, b) => {
        if (sortBy === 'name') {
          if (sortOrder === 'asc') return a.name.localeCompare(b.name);
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'description') {
          if (sortOrder === 'asc') return a.description.localeCompare(b.description);
          return b.description.localeCompare(a.description);
        }
        return 0;
      });

      setSearchResults(sortedResults);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
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
        <option value="all">All</option>
        <option value="leadMagnet">Lead Magnets</option>
        <option value="template">Templates</option>
      </select>
      <select value={filterStatus} onChange={handleFilterStatusChange}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select value={sortOrder} onChange={handleSortOrderChange}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <select value={sortBy} onChange={handleSortByChange}>
        <option value="name">Name</option>
        <option value="description">Description</option>
      </select>
      {isSearching ? (
        <div>
          {searchResults.map((item) => (
            <div key={item.id}>
              <LeadMagnetCard leadMagnet={item} />
              <TemplateCard template={item} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {leadMagnets.map((leadMagnet) => (
            <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
          ))}
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
          <AnalyticsCard analytics={analytics} />
          <SettingsCard settings={settings} />
          <PricingCard pricing={pricing} />
        </div>
      )}
      <button onClick={handleCreateLeadMagnet}>Create Lead Magnet</button>
      <button onClick={handleCreateTemplate}>Create Template</button>
    </div>
  );
};

export default DashboardPage;