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

class TrieNode {
  children: { [key: string]: TrieNode };
  leadMagnets: any[];
  templates: any[];

  constructor() {
    this.children = {};
    this.leadMagnets = [];
    this.templates = [];
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insertLeadMagnet(leadMagnet: any) {
    let node = this.root;
    for (let char of leadMagnet.name) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.leadMagnets.push(leadMagnet);
  }

  insertTemplate(template: any) {
    let node = this.root;
    for (let char of template.name) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.templates.push(template);
  }

  searchLeadMagnets(query: string) {
    let node = this.root;
    for (let char of query) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectLeadMagnets(node);
  }

  searchTemplates(query: string) {
    let node = this.root;
    for (let char of query) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectTemplates(node);
  }

  collectLeadMagnets(node: TrieNode) {
    let leadMagnets = [...node.leadMagnets];
    for (let child of Object.values(node.children)) {
      leadMagnets = leadMagnets.concat(this.collectLeadMagnets(child));
    }
    return leadMagnets;
  }

  collectTemplates(node: TrieNode) {
    let templates = [...node.templates];
    for (let child of Object.values(node.children)) {
      templates = templates.concat(this.collectTemplates(child));
    }
    return templates;
  }
}

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
  const [trie, setTrie] = useState(new Trie());

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
        setFilteredLeadMagnets(trie.searchLeadMagnets(leadMagnetFilter));
      }
    };

    filterLeadMagnets();
  }, [leadMagnetFilter, trie]);

  useEffect(() => {
    const filterTemplates = () => {
      if (templateFilter === 'all') {
        setFilteredTemplates(templates);
      } else {
        setFilteredTemplates(trie.searchTemplates(templateFilter));
      }
    };

    filterTemplates();
  }, [templateFilter, trie]);

  useEffect(() => {
    const buildTrie = () => {
      const newTrie = new Trie();
      leadMagnets.forEach((leadMagnet) => newTrie.insertLeadMagnet(leadMagnet));
      templates.forEach((template) => newTrie.insertTemplate(template));
      setTrie(newTrie);
    };

    buildTrie();
  }, [leadMagnets, templates]);

  return (
    <div>
      <LeadMagnetCard leadMagnets={filteredLeadMagnets} />
      <TemplateCard templates={filteredTemplates} />
      <AnalyticsCard analytics={analytics} />
      <SettingsCard settings={settings} />
      <PricingCard pricing={pricing} />
      <Accordion>
        <AccordionItem>
          <AccordionButton>Filter</AccordionButton>
          <AccordionPanel>
            <Select
              value={leadMagnetFilter}
              onChange={(e) => setLeadMagnetFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DashboardPage;