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

  const exportToCSV = () => {
    const csvData = Object.keys(analytics).map((leadMagnetId) => {
      const leadMagnetAnalytics = analytics[leadMagnetId];
      return Object.keys(leadMagnetAnalytics).map((date) => {
        return {
          'Lead Magnet ID': leadMagnetId,
          Date: date,
          'Page Views': leadMagnetAnalytics[date].pageViews,
          'Unique Visitors': leadMagnetAnalytics[date].uniqueVisitors,
          'Conversion Rate': leadMagnetAnalytics[date].conversionRate,
        };
      });
    }).flat();
    const csvString = [
      ['Lead Magnet ID', 'Date', 'Page Views', 'Unique Visitors', 'Conversion Rate'],
      ...csvData,
    ]
      .map((row) => row.join(','))
      .join('\n');
    const csvBlob = new Blob([csvString], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = 'analytics-data.csv';
    csvLink.click();
  };

  const exportToExcel = () => {
    const excelData = Object.keys(analytics).map((leadMagnetId) => {
      const leadMagnetAnalytics = analytics[leadMagnetId];
      return Object.keys(leadMagnetAnalytics).map((date) => {
        return {
          'Lead Magnet ID': leadMagnetId,
          Date: date,
          'Page Views': leadMagnetAnalytics[date].pageViews,
          'Unique Visitors': leadMagnetAnalytics[date].uniqueVisitors,
          'Conversion Rate': leadMagnetAnalytics[date].conversionRate,
        };
      });
    }).flat();
    const excelString = [
      ['Lead Magnet ID', 'Date', 'Page Views', 'Unique Visitors', 'Conversion Rate'],
      ...excelData,
    ]
      .map((row) => row.join('\t'))
      .join('\n');
    const excelBlob = new Blob([excelString], { type: 'text/tab-separated-values' });
    const excelUrl = URL.createObjectURL(excelBlob);
    const excelLink = document.createElement('a');
    excelLink.href = excelUrl;
    excelLink.download = 'analytics-data.xlsx';
    excelLink.click();
  };

  return (
    <PageLayout>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Lead Magnet Builder Analytics</h1>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={exportToCSV}
          >
            Export to CSV
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={exportToExcel}
          >
            Export to Excel
          </button>
        </div>
      </div>
      {isLoadingLeadMagnets ? (
        <Loader />
      ) : (
        <div className="flex flex-wrap justify-center">
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
      {selectedLeadMagnets.length > 0 && (
        <div className="mt-4">
          <DatePicker
            selectsRange={true}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(update) => {
              handleDateRangeChange(update[0], update[1]);
            }}
            isClearable={true}
          />
          {isLoadingAnalytics ? (
            <Loader />
          ) : (
            <AnalyticsChart
              analytics={analytics}
              chartType={chartType}
              chartOptions={chartOptions}
              onChartTypeChange={(newChartType) => setChartType(newChartType)}
              onChartOptionsChange={(newChartOptions) => setChartOptions(newChartOptions)}
            />
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;