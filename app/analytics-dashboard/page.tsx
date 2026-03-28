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
        setDateRange({ startDate: null, endDate: null });
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
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Lead Magnets</h2>
          {isLoadingLeadMagnets ? (
            <div className="flex justify-center items-center">
              <div className="border-4 border-gray-200 border-t-gray-600 rounded-full w-12 h-12 animate-spin"></div>
              <span className="ml-4">Loading lead magnets...</span>
            </div>
          ) : (
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
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Date Range</h2>
          <div className="flex flex-col mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Predefined Ranges:</label>
            <select
              className="block w-full p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={predefinedDateRange}
              onChange={(e) => handlePredefinedDateRangeChange(e.target.value)}
            >
              <option value="">Select a range</option>
              <option value="last7Days">Last 7 days</option>
              <option value="last30Days">Last 30 days</option>
              <option value="yesterday">Yesterday</option>
            </select>
          </div>
          <div className="flex flex-col mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Custom Range:</label>
            <div className="flex justify-between">
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                placeholderText="Start date"
                className="block w-full p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="mx-2">to</span>
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                placeholderText="End date"
                className="block w-full p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          {selectedLeadMagnet && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Analytics</h2>
              {isLoadingAnalytics ? (
                <div className="flex justify-center items-center">
                  <div className="border-4 border-gray-200 border-t-gray-600 rounded-full w-12 h-12 animate-spin"></div>
                  <span className="ml-4">Loading analytics...</span>
                </div>
              ) : (
                <AnalyticsChart analytics={analytics} />
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;