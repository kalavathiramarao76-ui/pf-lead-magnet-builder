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
    for (let char of leadMagnet.name.toLowerCase()) {
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
    for (let char of template.name.toLowerCase()) {
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
    for (let char of query.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectLeadMagnets(node);
  }

  searchTemplates(query: string) {
    let node = this.root;
    for (let char of query.toLowerCase()) {
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
  }

  removeNode(node: TrieNode) {
    let parent = this.root;
    let path = [];
    while (parent !== node) {
      for (let char in parent.children) {
        if (parent.children[char] === node) {
          path.push(char);
          parent = parent.children[char];
          break;
        }
      }
    }
    for (let i = path.length - 1; i >= 0; i--) {
      let char = path[i];
      let parentNode = this.root;
      for (let j = 0; j < i; j++) {
        parentNode = parentNode.children[path[j]];
      }
      if (parentNode.children[char].children || parentNode.children[char].leadMagnets.length > 0 || parentNode.children[char].templates.length > 0) {
        return;
      }
      delete parentNode.children[char];
    }
  }

  autocompleteLeadMagnets(query: string) {
    let node = this.root;
    for (let char of query.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectAutocompleteLeadMagnets(node);
  }

  collectAutocompleteLeadMagnets(node: TrieNode) {
    let leadMagnets = [...node.leadMagnets];
    for (let child of Object.values(node.children)) {
      leadMagnets = leadMagnets.concat(this.collectAutocompleteLeadMagnets(child));
    }
    return leadMagnets;
  }

  autocompleteTemplates(query: string) {
    let node = this.root;
    for (let char of query.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectAutocompleteTemplates(node);
  }

  collectAutocompleteTemplates(node: TrieNode) {
    let templates = [...node.templates];
    for (let child of Object.values(node.children)) {
      templates = templates.concat(this.collectAutocompleteTemplates(child));
    }
    return templates;
  }
}

const LeadMagnetBuilder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteLeadMagnets, setAutocompleteLeadMagnets] = useState([]);
  const [autocompleteTemplates, setAutocompleteTemplates] = useState([]);
  const [filteredLeadMagnets, setFilteredLeadMagnets] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const trie = new Trie();

  useEffect(() => {
    const storedLeadMagnets = useLocalStorage('leadMagnets');
    const storedTemplates = useLocalStorage('templates');
    if (storedLeadMagnets) {
      setLeadMagnets(storedLeadMagnets);
      storedLeadMagnets.forEach((leadMagnet) => trie.insertLeadMagnet(leadMagnet));
    }
    if (storedTemplates) {
      setTemplates(storedTemplates);
      storedTemplates.forEach((template) => trie.insertTemplate(template));
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setAutocompleteLeadMagnets(trie.autocompleteLeadMagnets(query));
      setAutocompleteTemplates(trie.autocompleteTemplates(query));
    } else {
      setAutocompleteLeadMagnets([]);
      setAutocompleteTemplates([]);
    }
  };

  const handleFilter = (query: string) => {
    if (query.length > 0) {
      setFilteredLeadMagnets(trie.searchLeadMagnets(query));
      setFilteredTemplates(trie.searchTemplates(query));
    } else {
      setFilteredLeadMagnets(leadMagnets);
      setFilteredTemplates(templates);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search lead magnets and templates"
      />
      {autocompleteLeadMagnets.length > 0 && (
        <ul>
          {autocompleteLeadMagnets.map((leadMagnet) => (
            <li key={leadMagnet.name}>{leadMagnet.name}</li>
          ))}
        </ul>
      )}
      {autocompleteTemplates.length > 0 && (
        <ul>
          {autocompleteTemplates.map((template) => (
            <li key={template.name}>{template.name}</li>
          ))}
        </ul>
      )}
      <Select
        options={[
          { value: 'all', label: 'All' },
          { value: 'leadMagnets', label: 'Lead Magnets' },
          { value: 'templates', label: 'Templates' },
        ]}
        value="all"
        onChange={(value) => handleFilter(value)}
      />
      {filteredLeadMagnets.length > 0 && (
        <div>
          <h2>Lead Magnets</h2>
          {filteredLeadMagnets.map((leadMagnet) => (
            <LeadMagnetCard key={leadMagnet.name} leadMagnet={leadMagnet} />
          ))}
        </div>
      )}
      {filteredTemplates.length > 0 && (
        <div>
          <h2>Templates</h2>
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.name} template={template} />
          ))}
        </div>
      )}
      <AnalyticsCard />
      <SettingsCard />
      <PricingCard />
      <Accordion>
        <AccordionItem>
          <AccordionButton>Lead Magnets</AccordionButton>
          <AccordionPanel>
            {leadMagnets.map((leadMagnet) => (
              <LeadMagnetCard key={leadMagnet.name} leadMagnet={leadMagnet} />
            ))}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>Templates</AccordionButton>
          <AccordionPanel>
            {templates.map((template) => (
              <TemplateCard key={template.name} template={template} />
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LeadMagnetBuilder;