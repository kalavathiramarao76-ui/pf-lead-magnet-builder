use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLeadMagnets, getLeadMagnetAnalytics } from '../lib/analytics';
import { LeadMagnet, LeadMagnetAnalytics } from '../types';
import AnalyticsChart from '../components/analytics-chart';
import LeadMagnetCard from '../components/lead-magnet-card';
import PageLayout from '../components/page-layout';

const AnalyticsDashboardPage = () => {
  const pathname = usePathname();
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState<LeadMagnet | null>(null);
  const [analytics, setAnalytics] = useState<LeadMagnetAnalytics | null>(null);

  useEffect(() => {
    const storedLeadMagnets = localStorage.getItem('leadMagnets');
    if (storedLeadMagnets) {
      setLeadMagnets(JSON.parse(storedLeadMagnets));
    } else {
      getLeadMagnets().then((data) => {
        setLeadMagnets(data);
        localStorage.setItem('leadMagnets', JSON.stringify(data));
      });
    }
  }, []);

  const handleLeadMagnetSelect = (leadMagnet: LeadMagnet) => {
    setSelectedLeadMagnet(leadMagnet);
    getLeadMagnetAnalytics(leadMagnet.id).then((data) => {
      setAnalytics(data);
    });
  };

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Lead Magnets</h2>
          <ul>
            {leadMagnets.map((leadMagnet) => (
              <li key={leadMagnet.id}>
                <LeadMagnetCard
                  leadMagnet={leadMagnet}
                  isSelected={selectedLeadMagnet === leadMagnet}
                  onSelect={() => handleLeadMagnetSelect(leadMagnet)}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col">
          {selectedLeadMagnet && analytics && (
            <AnalyticsChart analytics={analytics} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;