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
  isEndOfWord: boolean;

  constructor() {
    this.children = {};
    this.leadMagnets = [];
    this.templates = [];
    this.isEndOfWord = false;
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
    node.isEndOfWord = true;
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
    node.isEndOfWord = true;
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
    if (node.isEndOfWord) {
      for (let child of Object.values(node.children)) {
        leadMagnets = leadMagnets.concat(this.collectLeadMagnets(child));
      }
    }
    return leadMagnets;
  }

  collectTemplates(node: TrieNode) {
    let templates = [...node.templates];
    if (node.isEndOfWord) {
      for (let child of Object.values(node.children)) {
        templates = templates.concat(this.collectTemplates(child));
      }
    }
    return templates;
  }

  removeLeadMagnet(leadMagnet: any) {
    let node = this.root;
    for (let char of leadMagnet.name) {
      if (!node.children[char]) {
        return;
      }
      node = node.children[char];
    }
    node.leadMagnets = node.leadMagnets.filter((lm) => lm !== leadMagnet);
    if (node.leadMagnets.length === 0 && !node.isEndOfWord) {
      this.removeNode(node);
    }
  }

  removeTemplate(template: any) {
    let node = this.root;
    for (let char of template.name) {
      if (!node.children[char]) {
        return;
      }
      node = node.children[char];
    }
    node.templates = node.templates.filter((t) => t !== template);
    if (node.templates.length === 0 && !node.isEndOfWord) {
      this.removeNode(node);
    }
  }

  removeNode(node: TrieNode) {
    let parent = this.root;
    for (let char of Object.keys(this.root.children)) {
      if (this.root.children[char] === node) {
        delete parent.children[char];
        return;
      }
      parent = parent.children[char];
    }
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
  const [filterType, setFilterType] = useState('');
  const trie = new Trie();

  useEffect(() => {
    const storedLeadMagnets = useLocalStorage('leadMagnets');
    const storedTemplates = useLocalStorage('templates');
    if (storedLeadMagnets) {
      storedLeadMagnets.forEach((leadMagnet) => trie.insertLeadMagnet(leadMagnet));
      setLeadMagnets(storedLeadMagnets);
    }
    if (storedTemplates) {
      storedTemplates.forEach((template) => trie.insertTemplate(template));
      setTemplates(storedTemplates);
    }
  }, []);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    const leadMagnetResults = trie.searchLeadMagnets(query);
    const templateResults = trie.searchTemplates(query);
    setSearchResults([...leadMagnetResults, ...templateResults]);
    setIsSearching(false);
  };

  return (
    <div>
      <LeadMagnetCard leadMagnets={leadMagnets} />
      <TemplateCard templates={templates} />
      <AnalyticsCard analytics={analytics} />
      <SettingsCard settings={settings} />
      <PricingCard pricing={pricing} />
      <Accordion>
        <AccordionItem>
          <AccordionButton>Search</AccordionButton>
          <AccordionPanel>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lead magnets and templates"
            />
            <button onClick={() => handleSearch(searchTerm)}>Search</button>
            {isSearching ? (
              <p>Searching...</p>
            ) : (
              <ul>
                {searchResults.map((result) => (
                  <li key={result.name}>{result.name}</li>
                ))}
              </ul>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        options={[
          { value: '', label: 'All' },
          { value: 'leadMagnet', label: 'Lead Magnets' },
          { value: 'template', label: 'Templates' },
        ]}
      />
    </div>
  );
};

export default DashboardPage;