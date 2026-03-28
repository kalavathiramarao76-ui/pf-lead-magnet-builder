import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLeadMagnets, getLeadMagnetAnalytics } from '../lib/analytics';
import { LeadMagnet, LeadMagnetAnalytics } from '../types';
import AnalyticsChart from '../components/analytics-chart';
import LeadMagnetCard from '../components/lead-magnet-card';
import PageLayout from '../components/page-layout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AnalyticsDashboardPage = () => {
  const pathname = usePathname();
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState<LeadMagnet | null>(null);
  const [analytics, setAnalytics] = useState<LeadMagnetAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const [predefinedDateRange, setPredefinedDateRange] = useState<string | null>(null);
  const [isLoadingLeadMagnets, setIsLoadingLeadMagnets] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

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

  const handleLeadMagnetSelect = (leadMagnet: LeadMagnet) => {
    setSelectedLeadMagnet(leadMagnet);
    setIsLoadingAnalytics(true);
    getLeadMagnetAnalytics(leadMagnet.id, dateRange.startDate, dateRange.endDate).then((data) => {
      setAnalytics(data);
      setIsLoadingAnalytics(false);
    });
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRange({ startDate, endDate });
    setPredefinedDateRange(null);
    if (selectedLeadMagnet) {
      setIsLoadingAnalytics(true);
      getLeadMagnetAnalytics(selectedLeadMagnet.id, startDate, endDate).then((data) => {
        setAnalytics(data);
        setIsLoadingAnalytics(false);
      });
    }
  };

  const handlePredefinedDateRangeChange = (range: string) => {
    setPredefinedDateRange(range);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    switch (range) {
      case 'last7Days':
        setDateRange({ startDate: last7Days, endDate: today });
        break;
      case 'last30Days':
        setDateRange({ startDate: last30Days, endDate: today });
        break;
      case 'yesterday':
        setDateRange({ startDate: yesterday, endDate: yesterday });
        break;
      default:
        break;
    }
    if (selectedLeadMagnet) {
      setIsLoadingAnalytics(true);
      getLeadMagnetAnalytics(selectedLeadMagnet.id, dateRange.startDate, dateRange.endDate).then((data) => {
        setAnalytics(data);
        setIsLoadingAnalytics(false);
      });
    }
  };

  return (
    <PageLayout>
      {isLoadingLeadMagnets ? (
        <div>Loading lead magnets...</div>
      ) : (
        <div>
          {leadMagnets.map((leadMagnet) => (
            <LeadMagnetCard key={leadMagnet.id} leadMagnet={leadMagnet} onSelect={handleLeadMagnetSelect} />
          ))}
          {selectedLeadMagnet && (
            <div>
              <DatePicker
                selectsRange={true}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={handleDateRangeChange}
                dateFormat="yyyy-MM-dd"
              />
              <select value={predefinedDateRange} onChange={(e) => handlePredefinedDateRangeChange(e.target.value)}>
                <option value="">Select a date range</option>
                <option value="last7Days">Last 7 days</option>
                <option value="last30Days">Last 30 days</option>
                <option value="yesterday">Yesterday</option>
              </select>
              {isLoadingAnalytics ? (
                <div>Loading analytics...</div>
              ) : (
                analytics && <AnalyticsChart analytics={analytics} />
              )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;