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
  const [selectedLeadMagnets, setSelectedLeadMagnets] = useState<LeadMagnet[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, LeadMagnetAnalytics>>({});
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

  const handleLeadMagnetSelect = (leadMagnet: LeadMagnet, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeadMagnets((prevSelected) => [...prevSelected, leadMagnet]);
    } else {
      setSelectedLeadMagnets((prevSelected) => prevSelected.filter((lm) => lm.id !== leadMagnet.id));
    }
    if (isSelected) {
      setIsLoadingAnalytics(true);
      getLeadMagnetAnalytics(leadMagnet.id, dateRange.startDate, dateRange.endDate).then((data) => {
        setAnalytics((prevAnalytics) => ({ ...prevAnalytics, [leadMagnet.id]: data }));
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
    Promise.all(
      selectedLeadMagnets.map((leadMagnet) =>
        getLeadMagnetAnalytics(leadMagnet.id, startDate, endDate).then((data) => ({ [leadMagnet.id]: data }))
      )
    ).then((results) => {
      const newAnalytics = results.reduce((acc, result) => ({ ...acc, ...result }), {});
      setAnalytics(newAnalytics);
      setIsLoadingAnalytics(false);
    });
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
    }
    setIsLoadingAnalytics(true);
    Promise.all(
      selectedLeadMagnets.map((leadMagnet) =>
        getLeadMagnetAnalytics(leadMagnet.id, dateRange.startDate, dateRange.endDate).then((data) => ({ [leadMagnet.id]: data }))
      )
    ).then((results) => {
      const newAnalytics = results.reduce((acc, result) => ({ ...acc, ...result }), {});
      setAnalytics(newAnalytics);
      setIsLoadingAnalytics(false);
    });
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3">
          {leadMagnets.map((leadMagnet) => (
            <LeadMagnetCard
              key={leadMagnet.id}
              leadMagnet={leadMagnet}
              isSelected={selectedLeadMagnets.includes(leadMagnet)}
              onSelect={(isSelected) => handleLeadMagnetSelect(leadMagnet, isSelected)}
            />
          ))}
        </div>
        <div className="w-full md:w-2/3">
          <div className="flex justify-between mb-4">
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(startDate, endDate) => handleDateRangeChange(startDate, endDate)}
              className="mr-4"
            />
            <select
              value={predefinedDateRange}
              onChange={(e) => handlePredefinedDateRangeChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              <option value="">Select a predefined date range</option>
              <option value="last7Days">Last 7 days</option>
              <option value="last30Days">Last 30 days</option>
              <option value="yesterday">Yesterday</option>
            </select>
          </div>
          {selectedLeadMagnets.length > 0 && (
            <AnalyticsChart
              analytics={analytics}
              leadMagnets={selectedLeadMagnets}
              dateRange={dateRange}
              isLoading={isLoadingAnalytics}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;