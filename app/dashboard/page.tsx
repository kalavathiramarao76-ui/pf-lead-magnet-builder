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
  const [filteredLeadMagnets, setFilteredLeadMagnets] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);

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

  useEffect(() => {
    const filterLeadMagnets = () => {
      if (leadMagnetFilter === 'all') {
        setFilteredLeadMagnets(leadMagnets);
      } else {
        setFilteredLeadMagnets(leadMagnets.filter((leadMagnet) => leadMagnet.name.includes(leadMagnetFilter)));
      }
    };

    filterLeadMagnets();
  }, [leadMagnetFilter, leadMagnets]);

  useEffect(() => {
    const filterTemplates = () => {
      if (templateFilter === 'all') {
        setFilteredTemplates(templates);
      } else {
        setFilteredTemplates(templates.filter((template) => template.name.includes(templateFilter)));
      }
    };

    filterTemplates();
  }, [templateFilter, templates]);

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
      const results = [...leadMagnets, ...templates].filter((item) => item.name.includes(searchTerm));
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleLeadMagnetFilterChange = (event) => {
    setLeadMagnetFilter(event.target.value);
  };

  const handleTemplateFilterChange = (event) => {
    setTemplateFilter(event.target.value);
  };

  return (
    <div>
      <h1>Lead Magnet Builder Dashboard</h1>
      <div>
        <button onClick={handleCreateLeadMagnet}>Create Lead Magnet</button>
        <button onClick={handleCreateTemplate}>Create Template</button>
      </div>
      <div>
        <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search" />
      </div>
      <div>
        <select value={leadMagnetFilter} onChange={handleLeadMagnetFilterChange}>
          <option value="all">All Lead Magnets</option>
          <option value="new">New Lead Magnets</option>
          <option value="popular">Popular Lead Magnets</option>
        </select>
        <select value={templateFilter} onChange={handleTemplateFilterChange}>
          <option value="all">All Templates</option>
          <option value="new">New Templates</option>
          <option value="popular">Popular Templates</option>
        </select>
      </div>
      <div>
        {filteredLeadMagnets.map((leadMagnet) => (
          <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
        ))}
      </div>
      <div>
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      <div>
        <AnalyticsCard analytics={analytics} />
        <SettingsCard settings={settings} />
        <PricingCard pricing={pricing} />
      </div>
    </div>
  );
};

export default DashboardPage;