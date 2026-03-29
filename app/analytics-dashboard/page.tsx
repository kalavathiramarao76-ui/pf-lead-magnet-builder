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
    const fetchAnalytics = async () => {
      if (selectedLeadMagnets.length > 0) {
        const data = await getBatchLeadMagnetAnalytics(selectedLeadMagnets.map((lm) => lm.id), range?.from, range?.to);
        setAnalytics((prevAnalytics) => ({ ...prevAnalytics, ...data }));
      }
      setIsLoadingAnalytics(false);
      setIsChartLoading(false);
    };
    fetchAnalytics();
  };

  const dateRangePickerSettings: DateRangePickerSettings = {
    allowSingleDateInRange: true,
    bounds: [
      { min: new Date('2020-01-01'), max: new Date('2025-12-31') },
    ],
    minDate: new Date('2020-01-01'),
    maxDate: new Date('2025-12-31'),
    getInitialDate: () => new Date(),
    amountOfMonths: 2,
    step: 1,
    allowDeselect: true,
    clearable: true,
    placeholder: 'Select date range',
    labelFormat: 'MMM dd, yyyy',
    dropdownType: 'modal',
    withinPortal: true,
    size: 'md',
    inputFormat: 'MMM dd, yyyy',
    firstDayOfWeek: 0,
    locale: 'en',
    getDayText: (date) => date.toLocaleDateString('en', { weekday: 'long' }),
    getMonthText: (date) => date.toLocaleString('en', { month: 'long' }),
    getYearText: (date) => date.toLocaleString('en', { year: 'numeric' }),
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-bold mb-4">Lead Magnets</h2>
          {isLoadingLeadMagnets ? (
            <Loader />
          ) : (
            leadMagnets.map((leadMagnet) => (
              <LeadMagnetCard
                key={leadMagnet.id}
                leadMagnet={leadMagnet}
                isSelected={selectedLeadMagnets.includes(leadMagnet)}
                onToggleSelect={(isSelected) => handleLeadMagnetSelect(leadMagnet, isSelected)}
              />
            ))
          )}
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-bold mb-4">Date Range Picker</h2>
          <DateRangePicker
            settings={dateRangePickerSettings}
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
          />
          {isLoadingAnalytics || isChartLoading ? (
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