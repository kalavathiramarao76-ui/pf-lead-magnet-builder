import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLeadMagnets, getLeadMagnetAnalytics, getBatchLeadMagnetAnalytics } from '../lib/analytics';
import { LeadMagnet, LeadMagnetAnalytics } from '../types';
import AnalyticsChart from '../components/analytics-chart';
import LeadMagnetCard from '../components/lead-magnet-card';
import PageLayout from '../components/page-layout';
import { DateRangePicker, DateRange } from '@mantine/dates';
import Loader from '../components/loader';

const AnalyticsDashboardPage = () => {
  const pathname = usePathname();
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [selectedLeadMagnets, setSelectedLeadMagnets] = useState<LeadMagnet[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, LeadMagnetAnalytics>>({});
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [predefinedDateRange, setPredefinedDateRange] = useState<string | null>(null);
  const [isLoadingLeadMagnets, setIsLoadingLeadMagnets] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [chartType, setChartType] = useState<string>('line');
  const [chartOptions, setChartOptions] = useState({
    displayLegend: true,
    displayGrid: true,
  });

  useEffect(() => {
    const storedLeadMagnets = localStorage.getItem('leadMagnets');
    if (storedLeadMagnets) {
      setLeadMagnets(JSON.parse(storedLeadMagnets));
      setIsLoadingLeadMagnets(false);
    } else {
      getLeadMagnets().then((data) => {
        setLeadMagnets(data);
        localStorage.setItem('leadMagnets', JSON.stringify(data));
        setIsLoadingLeadMagnets(false);
      });
    }
  }, []);

  const handleLeadMagnetSelect = (leadMagnet: LeadMagnet, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeadMagnets((prevSelected) => [...prevSelected, leadMagnet]);
    } else {
      setSelectedLeadMagnets((prevSelected) => prevSelected.filter((lm) => lm.id !== leadMagnet.id));
    }
    if (isSelected) {
      setIsLoadingAnalytics(true);
      getBatchLeadMagnetAnalytics([leadMagnet.id], dateRange?.from, dateRange?.to).then((data) => {
        setAnalytics((prevAnalytics) => ({ ...prevAnalytics, ...data }));
        setIsLoadingAnalytics(false);
      });
    } else {
      setAnalytics((prevAnalytics) => {
        const { [leadMagnet.id]: removed, ...rest } = prevAnalytics;
        return rest;
      });
    }
  };

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range);
    setPredefinedDateRange(null);
    setIsLoadingAnalytics(true);
    getBatchLeadMagnetAnalytics(
      selectedLeadMagnets.map((leadMagnet) => leadMagnet.id),
      range?.from,
      range?.to
    ).then((data) => {
      setAnalytics(data);
      setIsLoadingAnalytics(false);
    });
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Lead Magnets</h2>
          <div className="flex flex-wrap gap-2">
            {leadMagnets.map((leadMagnet) => (
              <LeadMagnetCard
                key={leadMagnet.id}
                leadMagnet={leadMagnet}
                isSelected={selectedLeadMagnets.includes(leadMagnet)}
                onSelect={(isSelected) => handleLeadMagnetSelect(leadMagnet, isSelected)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Date Range</h2>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            labelFormat="MMMM dd, yyyy"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Analytics</h2>
          {isLoadingAnalytics ? (
            <Loader />
          ) : (
            <AnalyticsChart
              analytics={analytics}
              chartType={chartType}
              chartOptions={chartOptions}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;