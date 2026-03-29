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
    if (key) {
      delete parent.children[key];
    }
  }

  autocomplete(query: string) {
    let node = this.root;
    for (let char of query) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectAutocomplete(node, query);
  }

  collectAutocomplete(node: TrieNode, query: string) {
    let suggestions = [];
    if (node.isEndOfWord) {
      suggestions = suggestions.concat(node.leadMagnets.map((lm) => lm.name));
      suggestions = suggestions.concat(node.templates.map((t) => t.name));
    }
    for (let child of Object.values(node.children)) {
      suggestions = suggestions.concat(this.collectAutocomplete(child, query));
    }
    return suggestions;
  }
}

const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const trie = new Trie();

  useEffect(() => {
    // Initialize trie with lead magnets and templates
    const leadMagnets = [
      { name: 'Lead Magnet 1' },
      { name: 'Lead Magnet 2' },
      { name: 'Lead Magnet 3' },
    ];
    const templates = [
      { name: 'Template 1' },
      { name: 'Template 2' },
      { name: 'Template 3' },
    ];
    leadMagnets.forEach((lm) => trie.insertLeadMagnet(lm));
    templates.forEach((t) => trie.insertTemplate(t));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const leadMagnets = trie.searchLeadMagnets(query);
    const templates = trie.searchTemplates(query);
    setSearchResults(leadMagnets.concat(templates));
  };

  const handleAutocomplete = (query: string) => {
    const suggestions = trie.autocomplete(query);
    setAutocompleteSuggestions(suggestions);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => {
          handleSearch(e.target.value);
          handleAutocomplete(e.target.value);
        }}
        placeholder="Search lead magnets and templates"
      />
      <ul>
        {autocompleteSuggestions.map((suggestion) => (
          <li key={suggestion}>{suggestion}</li>
        ))}
      </ul>
      <h2>Search Results</h2>
      <ul>
        {searchResults.map((result) => (
          <li key={result.name}>{result.name}</li>
        ))}
      </ul>
      <LeadMagnetCard />
      <TemplateCard />
      <AnalyticsCard />
      <SettingsCard />
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