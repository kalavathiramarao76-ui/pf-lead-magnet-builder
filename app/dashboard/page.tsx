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
      name: 'New Lead Magnet',
      description: 'New lead magnet description',
    };
    setLeadMagnets([...leadMagnets, newLeadMagnet]);
    setItem('leadMagnets', JSON.stringify([...leadMagnets, newLeadMagnet]));
  };

  return (
    <div className="dashboard-container">
      <div className="header-section">
        <h1>Lead Magnet Builder Dashboard</h1>
        <button onClick={handleCreateLeadMagnet}>Create New Lead Magnet</button>
      </div>
      <div className="main-section">
        <div className="lead-magnets-section">
          <h2>Lead Magnets</h2>
          <div className="lead-magnets-grid">
            {filteredLeadMagnets.map((leadMagnet, index) => (
              <LeadMagnetCard key={index} leadMagnet={leadMagnet} />
            ))}
          </div>
        </div>
        <div className="templates-section">
          <h2>Templates</h2>
          <div className="templates-grid">
            {filteredTemplates.map((template, index) => (
              <TemplateCard key={index} template={template} />
            ))}
          </div>
        </div>
      </div>
      <div className="sidebar-section">
        <div className="analytics-section">
          <h2>Analytics</h2>
          <AnalyticsCard analytics={analytics} />
        </div>
        <div className="settings-section">
          <h2>Settings</h2>
          <SettingsCard settings={settings} />
        </div>
        <div className="pricing-section">
          <h2>Pricing</h2>
          <PricingCard pricing={pricing} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;