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

  const handleDateRangePickerChange = (range: DateRange | null) => {
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

  const dateRangePickerSettings: DateRangePickerSettings = {
    allowSingleDateInRange: true,
    allowDeselect: true,
    minDate: new Date('2020-01-01'),
    maxDate: new Date(),
    excludeDate: (date) => date.getDay() === 0 || date.getDay() === 6,
    bounds: [
      { min: new Date('2020-01-01'), max: new Date('2022-12-31') },
    ],
  };

  return (
    <PageLayout>
      <div>
        <h1>Lead Magnet Builder Analytics Dashboard</h1>
        <div>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangePickerChange}
            settings={dateRangePickerSettings}
            placeholder="Select date range"
            label="Date range"
            withinPortal
          />
        </div>
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
          </div>
        )}
        {isLoadingAnalytics ? (
          <Loader />
        ) : (
          <div>
            <AnalyticsChart
              analytics={analytics}
              chartType={chartType}
              chartOptions={chartOptions}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;