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
    let char = '';
    let stack: [TrieNode, string][] = [[this.root, '']];
    while (stack.length > 0) {
      let [n, c] = stack.pop()!;
      if (n === node) {
        parent = this.findParent(stack);
        char = c;
        break;
      }
      for (let childChar in n.children) {
        stack.push([n.children[childChar], childChar]);
      }
    }
    if (parent) {
      delete parent.children[char];
    }
  }

  findParent(stack: [TrieNode, string][]) {
    if (stack.length === 0) {
      return null;
    }
    return stack[stack.length - 1][0];
  }
}

const LeadMagnetBuilder = () => {
  const [leadMagnets, setLeadMagnets] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [trie, setTrie] = useState(new Trie());

  useEffect(() => {
    const storedLeadMagnets = useLocalStorage('leadMagnets', []);
    const storedTemplates = useLocalStorage('templates', []);
    setLeadMagnets(storedLeadMagnets);
    setTemplates(storedTemplates);
    const trie = new Trie();
    storedLeadMagnets.forEach((leadMagnet) => trie.insertLeadMagnet(leadMagnet));
    storedTemplates.forEach((template) => trie.insertTemplate(template));
    setTrie(trie);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const leadMagnets = trie.searchLeadMagnets(query);
    const templates = trie.searchTemplates(query);
    setLeadMagnets(leadMagnets);
    setTemplates(templates);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search lead magnets and templates"
      />
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

export default LeadMagnetBuilder;