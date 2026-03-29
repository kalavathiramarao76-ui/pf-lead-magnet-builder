import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLeadMagnets, getLeadMagnetAnalytics, getBatchLeadMagnetAnalytics } from '../lib/analytics';
import { LeadMagnet, LeadMagnetAnalytics } from '../types';
import AnalyticsChart from '../components/analytics-chart';
import LeadMagnetCard from '../components/lead-magnet-card';
import PageLayout from '../components/page-layout';
import { 
  DateRangePicker, 
  DateRange, 
  DateRangePickerValue, 
  DateRangePickerSettings 
} from '@mantine/dates';
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
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    const storedLeadMagnets = localStorage.getItem('leadMagnets');
    if (storedLeadMagnets) {
      setLeadMagnets(JSON.parse(storedLeadMagnets));
      setIsLoadingLeadMagnets(false);
    } else {
      const fetchLeadMagnets = async () => {
        const data = await getLeadMagnets();
        setLeadMagnets(data);
        localStorage.setItem('leadMagnets', JSON.stringify(data));
        setIsLoadingLeadMagnets(false);
      };
      fetchLeadMagnets();
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
      setIsChartLoading(true);
      const fetchAnalytics = async () => {
        const data = await getBatchLeadMagnetAnalytics([leadMagnet.id], dateRange?.from, dateRange?.to);
        setAnalytics((prevAnalytics) => ({ ...prevAnalytics, ...data }));
        setIsLoadingAnalytics(false);
        setIsChartLoading(false);
      };
      fetchAnalytics();
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
    setIsChartLoading(true);
    const selectedLeadMagnetIds = selectedLeadMagnets.map((leadMagnet) => leadMagnet.id);
    const fetchBatchAnalytics = async () => {
      const data = await getBatchLeadMagnetAnalytics(selectedLeadMagnetIds, range?.from, range?.to);
      setAnalytics((prevAnalytics) => ({ ...prevAnalytics, ...data }));
      setIsLoadingAnalytics(false);
      setIsChartLoading(false);
    };
    fetchBatchAnalytics();
  };

  return (
    <PageLayout>
      {isLoadingLeadMagnets ? (
        <Loader />
      ) : (
        <div>
          {leadMagnets.map((leadMagnet) => (
            <LeadMagnetCard
              key={leadMagnet.id}
              leadMagnet={leadMagnet}
              isSelected={selectedLeadMagnets.includes(leadMagnet)}
              onSelect={(isSelected) => handleLeadMagnetSelect(leadMagnet, isSelected)}
            />
          ))}
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            label="Date range"
          />
          {isChartLoading ? (
            <Loader />
          ) : (
            <AnalyticsChart
              analytics={analytics}
              chartType={chartType}
              chartOptions={chartOptions}
            />
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;