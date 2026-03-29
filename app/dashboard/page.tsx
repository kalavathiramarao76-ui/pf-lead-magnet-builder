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
    let path = [];
    while (parent !== node) {
      for (let child of Object.keys(parent.children)) {
        if (parent.children[child] === node) {
          path.push(child);
          parent = parent.children[child];
          break;
        }
      }
    }
    let key = path.pop();
    delete parent.children[key];
  }
}

const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const trie = new Trie();

  useEffect(() => {
    // Initialize lead magnets and templates
    const leadMagnetsData = [
      { name: 'Lead Magnet 1' },
      { name: 'Lead Magnet 2' },
      { name: 'Lead Magnet 3' },
    ];
    const templatesData = [
      { name: 'Template 1' },
      { name: 'Template 2' },
      { name: 'Template 3' },
    ];

    leadMagnetsData.forEach((leadMagnet) => trie.insertLeadMagnet(leadMagnet));
    templatesData.forEach((template) => trie.insertTemplate(template));

    setLeadMagnets(leadMagnetsData);
    setTemplates(templatesData);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searchedLeadMagnets = trie.searchLeadMagnets(query);
    const searchedTemplates = trie.searchTemplates(query);
    setLeadMagnets(searchedLeadMagnets);
    setTemplates(searchedTemplates);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search lead magnets and templates"
      />
      <h2>Lead Magnets</h2>
      {leadMagnets.map((leadMagnet) => (
        <LeadMagnetCard key={leadMagnet.name} leadMagnet={leadMagnet} />
      ))}
      <h2>Templates</h2>
      {templates.map((template) => (
        <TemplateCard key={template.name} template={template} />
      ))}
      <h2>Analytics</h2>
      <AnalyticsCard />
      <h2>Settings</h2>
      <SettingsCard />
      <h2>Pricing</h2>
      <PricingCard />
      <Accordion>
        <AccordionItem>
          <AccordionButton>Accordion Button</AccordionButton>
          <AccordionPanel>Accordion Panel</AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Select />
    </div>
  );
};

export default DashboardPage;