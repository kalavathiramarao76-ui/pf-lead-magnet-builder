import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LeadMagnetCard } from '../components/LeadMagnetCard';
import { TemplateCard } from '../components/TemplateCard';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { SettingsCard } from '../components/SettingsCard';
import { PricingCard } from '../components/PricingCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel } from '../components/Accordion';
import { Select } from '../components/Select';

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
    const newLeadMagnet = {};

    setLeadMagnets([...leadMagnets, newLeadMagnet]);
    setItem('leadMagnets', JSON.stringify([...leadMagnets, newLeadMagnet]));
  };

  const leadMagnetFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ];

  const templateFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'used', label: 'Used' },
    { value: 'unused', label: 'Unused' },
  ];

  return (
    <div>
      <h1>Lead Magnet Builder Dashboard</h1>
      <Accordion>
        <AccordionItem>
          <AccordionButton>Lead Magnet Filters</AccordionButton>
          <AccordionPanel>
            <Select
              value={leadMagnetFilter}
              onChange={(e) => setLeadMagnetFilter(e.target.value)}
              options={leadMagnetFilterOptions}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>Template Filters</AccordionButton>
          <AccordionPanel>
            <Select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              options={templateFilterOptions}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <div>
        {filteredLeadMagnets.map((leadMagnet) => (
          <LeadMagnetCard key={leadMagnet.name} leadMagnet={leadMagnet} />
        ))}
      </div>
      <div>
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.name} template={template} />
        ))}
      </div>
      <AnalyticsCard analytics={analytics} />
      <SettingsCard settings={settings} />
      <PricingCard pricing={pricing} />
      <button onClick={handleCreateLeadMagnet}>Create New Lead Magnet</button>
    </div>
  );
};

export default DashboardPage;