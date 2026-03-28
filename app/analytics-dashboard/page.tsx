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

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  const handleChartOptionsChange = (options: any) => {
    setChartOptions(options);
  };

  return (
    <PageLayout>
      {isLoadingLeadMagnets ? (
        <Loader />
      ) : (
        <div>
          <h1>Lead Magnet Builder Analytics Dashboard</h1>
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
          <div>
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(update) => {
                const [startDate, endDate] = update;
                handleDateRangeChange(startDate, endDate);
              }}
            />
          </div>
          <div>
            <select value={chartType} onChange={(e) => handleChartTypeChange(e.target.value)}>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
            <div>
              <label>
                Display Legend:
                <input
                  type="checkbox"
                  checked={chartOptions.displayLegend}
                  onChange={(e) => handleChartOptionsChange({ ...chartOptions, displayLegend: e.target.checked })}
                />
              </label>
              <label>
                Display Grid:
                <input
                  type="checkbox"
                  checked={chartOptions.displayGrid}
                  onChange={(e) => handleChartOptionsChange({ ...chartOptions, displayGrid: e.target.checked })}
                />
              </label>
            </div>
          </div>
          {isLoadingAnalytics ? (
            <Loader />
          ) : (
            <div>
              {selectedLeadMagnets.map((leadMagnet) => (
                <AnalyticsChart
                  key={leadMagnet.id}
                  leadMagnet={leadMagnet}
                  analytics={analytics[leadMagnet.id]}
                  chartType={chartType}
                  chartOptions={chartOptions}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AnalyticsDashboardPage;