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
  private cache: { [key: string]: any[] };

  constructor() {
    this.root = new TrieNode();
    this.cache = {};
  }

  insertLeadMagnet(leadMagnet: any) {
    let node = this.root;
    for (let char of leadMagnet.name.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.leadMagnets.push(leadMagnet);
    node.isEndOfWord = true;
    this.cache = {};
  }

  insertTemplate(template: any) {
    let node = this.root;
    for (let char of template.name.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.templates.push(template);
    node.isEndOfWord = true;
    this.cache = {};
  }

  searchLeadMagnets(query: string) {
    if (this.cache[query]) {
      return this.cache[query];
    }
    let node = this.root;
    for (let char of query.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    const leadMagnets = this.collectLeadMagnets(node);
    this.cache[query] = leadMagnets;
    return leadMagnets;
  }

  searchTemplates(query: string) {
    if (this.cache[query]) {
      return this.cache[query];
    }
    let node = this.root;
    for (let char of query.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    const templates = this.collectTemplates(node);
    this.cache[query] = templates;
    return templates;
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

  removeLeadMagnet(leadMagnet: any) {
    let node = this.root;
    for (let char of leadMagnet.name.toLowerCase()) {
      if (!node.children[char]) {
        return;
      }
      node = node.children[char];
    }
    node.leadMagnets = node.leadMagnets.filter((lm) => lm !== leadMagnet);
    if (node.leadMagnets.length === 0 && !node.isEndOfWord) {
      this.removeNode(node);
    }
    this.cache = {};
  }

  removeTemplate(template: any) {
    let node = this.root;
    for (let char of template.name.toLowerCase()) {
      if (!node.children[char]) {
        return;
      }
      node = node.children[char];
    }
    node.templates = node.templates.filter((t) => t !== template);
    if (node.templates.length === 0 && !node.isEndOfWord) {
      this.removeNode(node);
    }
    this.cache = {};
  }

  private removeNode(node: TrieNode) {
    let parent = this.root;
    let char = '';
    for (let c in parent.children) {
      if (parent.children[c] === node) {
        char = c;
        break;
      }
      parent = parent.children[c];
    }
    if (char) {
      delete parent.children[char];
    }
  }
}

export default function DashboardPage() {
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [query, setQuery] = useState('');
  const trie = new Trie();

  useEffect(() => {
    const storedLeadMagnets = useLocalStorage('leadMagnets');
    const storedTemplates = useLocalStorage('templates');
    setLeadMagnets(storedLeadMagnets);
    setTemplates(storedTemplates);
    storedLeadMagnets.forEach((leadMagnet) => trie.insertLeadMagnet(leadMagnet));
    storedTemplates.forEach((template) => trie.insertTemplate(template));
  }, []);

  const handleSearch = (query: string) => {
    setQuery(query);
    const leadMagnets = trie.searchLeadMagnets(query);
    const templates = trie.searchTemplates(query);
    setLeadMagnets(leadMagnets);
    setTemplates(templates);
  };

  return (
    <div>
      <h1>Lead Magnet Builder</h1>
      <input type="search" value={query} onChange={(e) => handleSearch(e.target.value)} />
      <Accordion>
        <AccordionItem>
          <AccordionButton>Lead Magnets</AccordionButton>
          <AccordionPanel>
            {leadMagnets.map((leadMagnet) => (
              <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
            ))}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>Templates</AccordionButton>
          <AccordionPanel>
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>Analytics</AccordionButton>
          <AccordionPanel>
            <AnalyticsCard />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>Settings</AccordionButton>
          <AccordionPanel>
            <SettingsCard />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>Pricing</AccordionButton>
          <AccordionPanel>
            <PricingCard />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Select />
    </div>
  );
}