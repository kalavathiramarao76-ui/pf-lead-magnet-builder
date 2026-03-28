import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLeadMagnets, getLeadMagnetAnalytics, getBatchLeadMagnetAnalytics } from '../lib/analytics';
import { LeadMagnet, LeadMagnetAnalytics } from '../types';
import AnalyticsChart from '../components/analytics-chart';
import LeadMagnetCard from '../components/lead-magnet-card';
import PageLayout from '../components/page-layout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loader from '../components/loader';

const AnalyticsDashboardPage = () => {
  const pathname = usePathname();
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [selectedLeadMagnets, setSelectedLeadMagnets] = useState<LeadMagnet[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, LeadMagnetAnalytics>>({});
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
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
      getBatchLeadMagnetAnalytics([leadMagnet.id], dateRange.startDate, dateRange.endDate).then((data) => {
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

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRange({ startDate, endDate });
    setPredefinedDateRange(null);
    setIsLoadingAnalytics(true);
    getBatchLeadMagnetAnalytics(
      selectedLeadMagnets.map((leadMagnet) => leadMagnet.id),
      startDate,
      endDate
    ).then((data) => {
      setAnalytics(data);
      setIsLoadingAnalytics(false);
    });
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
              onLeadMagnetSelect={(isSelected) => handleLeadMagnetSelect(leadMagnet, isSelected)}
            />
          ))}
          {selectedLeadMagnets.length > 0 && (
            <div>
              <DatePicker
                selectsRange={true}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={(update) => {
                  handleDateRangeChange(update[0], update[1]);
                }}
              />
              <AnalyticsChart
                chartType={chartType}
                chartOptions={chartOptions}
                analytics={analytics}
                leadMagnets={selectedLeadMagnets}
              />
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;