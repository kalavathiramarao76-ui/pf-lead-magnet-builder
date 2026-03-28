import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLeadMagnets, getLeadMagnetAnalytics } from '../lib/analytics';
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
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    switch (range) {
      case 'today':
        startDate = new Date();
        endDate = new Date();
        break;
      case 'yesterday':
        startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        endDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last7Days':
        startDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        break;
      case 'last30Days':
        startDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        break;
      case 'thisMonth':
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        endDate = new Date();
        break;
      case 'lastMonth':
        startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
        break;
      default:
        break;
    }
    setDateRange({ startDate, endDate });
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

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-4 space-y-4 md:space-y-0">
        <div className="w-full md:w-1/2 xl:w-1/3 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Lead Magnets</h2>
          {isLoadingLeadMagnets ? (
            <Loader />
          ) : (
            leadMagnets.map((leadMagnet) => (
              <LeadMagnetCard
                key={leadMagnet.id}
                leadMagnet={leadMagnet}
                isSelected={selectedLeadMagnets.includes(leadMagnet)}
                onSelect={(isSelected) => handleLeadMagnetSelect(leadMagnet, isSelected)}
              />
            ))
          )}
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Date Range</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-lg ${predefinedDateRange === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => handlePredefinedDateRangeChange('today')}
              >
                Today
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${predefinedDateRange === 'yesterday' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => handlePredefinedDateRangeChange('yesterday')}
              >
                Yesterday
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${predefinedDateRange === 'last7Days' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => handlePredefinedDateRangeChange('last7Days')}
              >
                Last 7 Days
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${predefinedDateRange === 'last30Days' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => handlePredefinedDateRangeChange('last30Days')}
              >
                Last 30 Days
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-lg ${predefinedDateRange === 'thisMonth' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => handlePredefinedDateRangeChange('thisMonth')}
              >
                This Month
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${predefinedDateRange === 'lastMonth' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => handlePredefinedDateRangeChange('lastMonth')}
              >
                Last Month
              </button>
            </div>
            <div className="flex space-x-2">
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Start Date"
              />
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="End Date"
              />
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 xl:w-2/3 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Analytics</h2>
          {isLoadingAnalytics ? (
            <Loader />
          ) : (
            <AnalyticsChart
              analytics={analytics}
              leadMagnets={selectedLeadMagnets}
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