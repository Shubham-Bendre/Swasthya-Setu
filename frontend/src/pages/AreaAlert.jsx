import React, { useEffect, useState } from 'react';
import { GetAllEmployees } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  CartesianGrid, XAxis, YAxis, Legend
} from 'recharts';
import {
  Users, AlertTriangle, MapPin, Mail, CheckCircle
} from 'lucide-react';
import emailjs from '@emailjs/browser';

const AreaAlert = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholdValue, setThresholdValue] = useState(10); // Default threshold value
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // EmailJS configuration
  // You'll need to sign up at emailjs.com and replace these with your actual values
  const emailjsServiceId = "service_6eek4ff"; 
  const emailjsTemplateId = "template_hrj9flo";
  const emailjsUserId = "YBRth00xjtfkWaILU";

  const fetchEmployees = async () => {
    try {
      const data = await GetAllEmployees('', 1, 1000);
      setEmployees(data.employees);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    
    // Initialize EmailJS
    emailjs.init(emailjsUserId);
  }, []);

  const calculateStats = () => {
    if (!employees.length) return null;

    // Region (Breed) distribution 
    const regionCount = employees.reduce((acc, employee) => {
      acc[employee.Breed] = (acc[employee.Breed] || 0) + 1;
      return acc;
    }, {});

    // Health issue (Defect) distribution
    const defectCount = employees.reduce((acc, employee) => {
      acc[employee.Defect] = (acc[employee.Defect] || 0) + 1;
      return acc;
    }, {});

    // Calculate defects by region
    const defectsByRegion = {};
    
    employees.forEach(employee => {
      const region = employee.Breed;
      const defect = employee.Defect;
      
      if (!defectsByRegion[region]) {
        defectsByRegion[region] = {};
      }
      
      defectsByRegion[region][defect] = (defectsByRegion[region][defect] || 0) + 1;
    });

    // Generate alerts based on threshold
    const alerts = [];
    
    Object.entries(defectsByRegion).forEach(([region, defects]) => {
      Object.entries(defects).forEach(([defect, count]) => {
        if (count >= thresholdValue) {
          alerts.push({
            region,
            defect,
            count,
            severity: count >= thresholdValue * 1.5 ? 'critical' : 'warning'
          });
        }
      });
    });

    // Format data for charts
    const regionData = Object.entries(regionCount).map(([region, count]) => ({ region, count }));
    const defectData = Object.entries(defectCount).map(([defect, count]) => ({ defect, count }));

    // Format defect by region data for table display
    const defectByRegionData = [];
    
    Object.entries(defectsByRegion).forEach(([region, defects]) => {
      Object.entries(defects).forEach(([defect, count]) => {
        defectByRegionData.push({
          region,
          defect,
          count,
          aboveThreshold: count >= thresholdValue
        });
      });
    });

    return {
      totalPatients: employees.length,
      regionData,
      defectData,
      defectByRegionData,
      alerts,
      alertRegions: new Set(alerts.map(a => a.region)).size,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length
    };
  };

  const sendAlertEmail = async () => {
    const stats = calculateStats();
    if (!stats || !stats.alerts.length) return;
    
    setSendingEmail(true);
    setEmailSent(false);
    
    try {
      // Format the alert data for the email
      const alertText = stats.alerts.map(alert => 
        `${alert.region}: ${alert.defect} - ${alert.count} cases (${alert.severity.toUpperCase()})`
      ).join('\n');
      
      const criticalRegions = stats.alerts
        .filter(a => a.severity === 'critical')
        .map(a => a.region);
      
      const uniqueCriticalRegions = [...new Set(criticalRegions)];
      
      // Prepare the email template parameters
      const templateParams = {
        to_email: "shubhambendre04@gmail.com", // Replace with recipient email
        from_name: "Area Alert System",
        total_alerts: stats.totalAlerts,
        critical_alerts: stats.criticalAlerts,
        regions_needing_attention: stats.alertRegions,
        alert_details: alertText,
        critical_regions: uniqueCriticalRegions.join(', ') || 'None',
        threshold_value: thresholdValue
      };
      
      // Send the email
      const response = await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        templateParams
      );
      
      if (response.status === 200) {
        setEmailSent(true);
        console.log('Email sent successfully!');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      alert('Failed to send alert email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading statistics...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  const stats = calculateStats();
  if (!stats) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Area Alert Dashboard</h1>
        
        <div className="flex items-center gap-4">
          {/* Email Alert Button */}
          <button
            onClick={sendAlertEmail}
            disabled={sendingEmail || !stats.alerts.length}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              !stats.alerts.length 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {sendingEmail ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                {emailSent ? 'Alert Sent' : 'Send Alert Email'}
              </>
            )}
          </button>
          
          {/* Success indicator */}
          {emailSent && (
            <span className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              Email sent successfully!
            </span>
          )}
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions Needing Attention</CardTitle>
            <MapPin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alertRegions}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Threshold</CardTitle>
            <div className="flex items-center">
              <input
                type="number"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className="w-16 text-right border rounded p-1"
                min="1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Alert when cases exceed this number
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Issues by Region Table */}
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Health Issues by Region</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.defectByRegionData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Region</th>
                    <th className="p-2 text-left">Health Issue</th>
                    <th className="p-2 text-center">Cases</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.defectByRegionData
                    .sort((a, b) => b.count - a.count)
                    .map((item, index) => {
                      const alert = stats.alerts.find(
                        a => a.region === item.region && a.defect === item.defect
                      );
                      
                      return (
                        <tr key={index} className={item.aboveThreshold ? 
                          (alert?.severity === 'critical' ? 'bg-red-50' : 'bg-amber-50') : ''}>
                          <td className="p-2 border-t">{item.region}</td>
                          <td className="p-2 border-t">{item.defect}</td>
                          <td className="p-2 border-t text-center">{item.count}</td>
                          <td className="p-2 border-t text-center">
                            {item.aboveThreshold ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert?.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {alert?.severity === 'critical' ? 'CRITICAL' : 'WARNING'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                NORMAL
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Region Distribution */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Region Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8">
                    {stats.regionData.map((entry, index) => {
                      const isAboveThreshold = stats.alerts.some(alert => alert.region === entry.region);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isAboveThreshold ? '#FF8042' : COLORS[index % COLORS.length]} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Issues Distribution */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Health Issues Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.defectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="defect"
                  >
                    {stats.defectData.map((entry, index) => {
                      const isAboveThreshold = stats.alerts.some(alert => alert.defect === entry.defect);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isAboveThreshold ? '#FF8042' : COLORS[index % COLORS.length]} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AreaAlert;