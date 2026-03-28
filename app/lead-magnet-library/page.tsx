use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LeadMagnetCard } from '../components/LeadMagnetCard';
import { LeadMagnet } from '../types/LeadMagnet';
import { getLeadMagnets } from '../utils/storage';

export default function LeadMagnetLibraryPage() {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const storedLeadMagnets = getLeadMagnets();
    setLeadMagnets(storedLeadMagnets);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-3xl font-bold mb-4">Lead Magnet Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {leadMagnets.map((leadMagnet) => (
          <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} />
        ))}
      </div>
    </div>
  );
}