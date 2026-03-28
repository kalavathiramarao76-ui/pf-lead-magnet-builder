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

  const handleExportToCSV = () => {
    const csvData = Object.keys(analytics).map((leadMagnetId) => {
      const leadMagnetAnalytics = analytics[leadMagnetId];
      return Object.keys(leadMagnetAnalytics).map((metric) => {
        return `${leadMagnetId},${metric},${leadMagnetAnalytics[metric]}`;
      });
    }).flat();
    const csvString = ['Lead Magnet ID,Metric,Value', ...csvData].join('\n');
    const csvBlob = new Blob([csvString], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = 'analytics_data.csv';
    csvLink.click();
  };

  const handleExportToExcel = () => {
    const excelData = Object.keys(analytics).map((leadMagnetId) => {
      const leadMagnetAnalytics = analytics[leadMagnetId];
      return Object.keys(leadMagnetAnalytics).map((metric) => {
        return { LeadMagnetID: leadMagnetId, Metric: metric, Value: leadMagnetAnalytics[metric] };
      });
    }).flat();
    const excelBlob = new Blob([JSON.stringify(excelData)], { type: 'application/json' });
    const excelUrl = URL.createObjectURL(excelBlob);
    const excelLink = document.createElement('a');
    excelLink.href = excelUrl;
    excelLink.download = 'analytics_data.json';
    excelLink.click();
  };

  return (
    <PageLayout>
      <div>
        <h1>Lead Magnet Builder Analytics Dashboard</h1>
        <div>
          <DatePicker
            selectsRange={true}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(update) => {
              handleDateRangeChange(update[0], update[1]);
            }}
          />
          <button onClick={handleExportToCSV}>Export to CSV</button>
          <button onClick={handleExportToExcel}>Export to Excel</button>
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
            {selectedLeadMagnets.map((leadMagnet) => (
              <AnalyticsChart key={leadMagnet.id} analytics={analytics[leadMagnet.id]} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;