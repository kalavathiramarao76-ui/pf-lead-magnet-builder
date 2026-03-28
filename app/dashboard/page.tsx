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

  const handleDragStart = (event, index, type) => {
    setDragging({ index, type });
  };

  const handleDragOver = (event, index, type) => {
    setDragOver({ index, type });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (dragging && dragOver) {
      if (dragging.type === 'leadMagnet') {
        const newLeadMagnets = [...leadMagnets];
        const leadMagnet = newLeadMagnets.splice(dragging.index, 1)[0];
        newLeadMagnets.splice(dragOver.index, 0, leadMagnet);
        setLeadMagnets(newLeadMagnets);
        setItem('leadMagnets', JSON.stringify(newLeadMagnets));
      } else if (dragging.type === 'template') {
        const newTemplates = [...templates];
        const template = newTemplates.splice(dragging.index, 1)[0];
        newTemplates.splice(dragOver.index, 0, template);
        setTemplates(newTemplates);
        setItem('templates', JSON.stringify(newTemplates));
      }
    }
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div>
      <h1>Lead Magnet Builder</h1>
      <div>
        <button onClick={handleCreateLeadMagnet}>Create Lead Magnet</button>
        <button onClick={handleCreateTemplate}>Create Template</button>
      </div>
      <input
        type="search"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search"
      />
      {isSearching ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Lead Magnets</h2>
          <div
            onDragOver={(event) => handleDragOver(event, 0, 'leadMagnet')}
            onDrop={handleDrop}
          >
            {leadMagnets.map((leadMagnet, index) => (
              <LeadMagnetCard
                key={leadMagnet.id}
                leadMagnet={leadMagnet}
                onDragStart={(event) => handleDragStart(event, index, 'leadMagnet')}
                draggable
              />
            ))}
          </div>
          <h2>Templates</h2>
          <div
            onDragOver={(event) => handleDragOver(event, 0, 'template')}
            onDrop={handleDrop}
          >
            {templates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onDragStart={(event) => handleDragStart(event, index, 'template')}
                draggable
              />
            ))}
          </div>
        </div>
      )}
      <AnalyticsCard analytics={analytics} />
      <SettingsCard settings={settings} />
      <PricingCard pricing={pricing} />
    </div>
  );
};

export default DashboardPage;