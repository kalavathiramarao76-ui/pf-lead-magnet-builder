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

  const handleDragStart = (event, item) => {
    setDragging(item);
  };

  const handleDragOver = (event, index) => {
    setDragOver(index);
  };

  const handleDrop = (event) => {
    if (dragging && dragOver !== null) {
      const newLeadMagnets = [...leadMagnets];
      const newTemplates = [...templates];
      const draggedItem = newLeadMagnets.find((item) => item.id === dragging.id) || newTemplates.find((item) => item.id === dragging.id);

      if (draggedItem) {
        const index = newLeadMagnets.indexOf(draggedItem);
        if (index !== -1) {
          newLeadMagnets.splice(index, 1);
        } else {
          const templateIndex = newTemplates.indexOf(draggedItem);
          newTemplates.splice(templateIndex, 1);
        }

        if (dragOver < newLeadMagnets.length) {
          newLeadMagnets.splice(dragOver, 0, draggedItem);
        } else {
          newTemplates.splice(dragOver - newLeadMagnets.length, 0, draggedItem);
        }

        setLeadMagnets(newLeadMagnets);
        setTemplates(newTemplates);
        setItem('leadMagnets', JSON.stringify(newLeadMagnets));
        setItem('templates', JSON.stringify(newTemplates));
      }
    }
    setDragging(null);
    setDragOver(null);
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
    <div>
      <div
        onDragOver={(event) => handleDragOver(event, 0)}
        onDrop={(event) => handleDrop(event)}
      >
        {leadMagnets.map((leadMagnet, index) => (
          <LeadMagnetCard
            key={leadMagnet.id}
            leadMagnet={leadMagnet}
            onDragStart={(event) => handleDragStart(event, leadMagnet)}
            draggable={true}
          />
        ))}
      </div>
      <div
        onDragOver={(event) => handleDragOver(event, leadMagnets.length)}
        onDrop={(event) => handleDrop(event)}
      >
        {templates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            onDragStart={(event) => handleDragStart(event, template)}
            draggable={true}
          />
        ))}
      </div>
      <AnalyticsCard analytics={analytics} />
      <SettingsCard settings={settings} />
      <PricingCard pricing={pricing} />
      <button onClick={handleCreateLeadMagnet}>Create Lead Magnet</button>
      <button onClick={handleCreateTemplate}>Create Template</button>
      <input type="search" value={searchTerm} onChange={handleSearch} />
      <div>
        {filteredLeadMagnets.map((leadMagnet) => (
          <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
        ))}
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;