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
      for (let child in parent.children) {
        if (parent.children[child] === node) {
          path.push(child);
          parent = parent.children[child];
          break;
        }
      }
    }
    path.reverse();
    for (let i = 0; i < path.length; i++) {
      let char = path[i];
      let parentNode = this.root;
      for (let j = 0; j < i; j++) {
        parentNode = parentNode.children[path[j]];
      }
      if (Object.keys(parentNode.children[char].children).length === 0) {
        delete parentNode.children[char];
      } else {
        break;
      }
    }
  }

  autocompleteLeadMagnets(query: string) {
    let node = this.root;
    for (let char of query) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectLeadMagnetNames(node);
  }

  collectLeadMagnetNames(node: TrieNode) {
    let names = [...node.leadMagnets.map((lm) => lm.name)];
    for (let child of Object.values(node.children)) {
      names = names.concat(this.collectLeadMagnetNames(child));
    }
    return names;
  }

  autocompleteTemplates(query: string) {
    let node = this.root;
    for (let char of query) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectTemplateNames(node);
  }

  collectTemplateNames(node: TrieNode) {
    let names = [...node.templates.map((t) => t.name)];
    for (let child of Object.values(node.children)) {
      names = names.concat(this.collectTemplateNames(child));
    }
    return names;
  }
}

const DashboardPage = () => {
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
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
    setSearchQuery(query);
    const leadMagnetSuggestions = trie.autocompleteLeadMagnets(query);
    const templateSuggestions = trie.autocompleteTemplates(query);
    setAutocompleteSuggestions([...leadMagnetSuggestions, ...templateSuggestions]);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setAutocompleteSuggestions([]);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search lead magnets and templates"
      />
      {autocompleteSuggestions.length > 0 && (
        <ul>
          {autocompleteSuggestions.map((suggestion) => (
            <li key={suggestion} onClick={() => handleSelectSuggestion(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
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
    </div>
  );
};

export default DashboardPage;