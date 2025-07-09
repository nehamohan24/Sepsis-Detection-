import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, Activity, Heart, Thermometer, BarChart2, Upload, FileText, Info, Loader } from "lucide-react";
import "./App.css";


export default function SepsisPredictionApp() {
  const [patientId, setPatientId] = useState("");
  const [timepoints, setTimepoints] = useState([]);
  const [currentTimepoint, setCurrentTimepoint] = useState({
    HR: 75, O2Sat: 98, Temp: 37, SBP: 120, MAP: 80, DBP: 70, 
    Resp: 16, EtCO2: 35, BaseExcess: 0, HCO3: 24, SepsisLabel: 0
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [fileUploadInfo, setFileUploadInfo] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

 
  const addTimepoint = () => {
    const timestamp = new Date().toISOString();
    const newTimepoint = { ...currentTimepoint, timestamp };
    setTimepoints([...timepoints, newTimepoint]);
    setSuccessMessage("Timepoint added successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const addMockData = () => {
    const mockTimepoints = [];
    const baseTime = new Date();
    

    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(baseTime);
      timestamp.setMinutes(baseTime.getMinutes() - (10 - i));
      
      mockTimepoints.push({
        HR: 75 + Math.random() * 10,
        O2Sat: 97 + Math.random() * 3,
        Temp: 36.8 + Math.random() * 0.6,
        SBP: 120 + Math.random() * 10,
        MAP: 80 + Math.random() * 5,
        DBP: 70 + Math.random() * 5,
        Resp: 16 + Math.random() * 4,
        EtCO2: 35 + Math.random() * 3,
        BaseExcess: 0 + Math.random() * 2 - 1,
        HCO3: 24 + Math.random() * 2 - 1,
        SepsisLabel: 0,
        timestamp: timestamp.toISOString()
      });
    }
    
    setTimepoints([...timepoints, ...mockTimepoints]);
    setSuccessMessage("Added 10 mock timepoints for testing");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setFileUploadInfo(`Processing file: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const isCSV = file.name.toLowerCase().endsWith('.csv');
        const isPSV = file.name.toLowerCase().endsWith('.psv');
        
        if (!isCSV && !isPSV) {
          throw new Error("File must be CSV or PSV format");
        }
        
        const delimiter = isPSV ? '|' : ',';
        
        const lines = content.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          throw new Error("File must contain header and at least one data row");
        }
        
        const header = lines[0].split(delimiter).map(h => h.trim());
        const requiredColumns = ['HR', 'O2Sat', 'Temp', 'SBP', 'MAP', 'DBP', 'Resp', 'EtCO2', 'BaseExcess', 'HCO3'];
        const missingColumns = requiredColumns.filter(col => !header.includes(col));
        
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
        
        const parsedTimepoints = [];
        const baseTime = new Date();
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          const values = lines[i].split(delimiter).map(v => v.trim());
          if (values.length !== header.length) {
            setFileUploadInfo(`Warning: Skipping row ${i} - column count mismatch`);
            continue;
          }
          
      
          const timepoint = {};
          header.forEach((col, index) => {
            const value = values[index];
        
            if (requiredColumns.includes(col)) {
              timepoint[col] = parseFloat(value) || 0;
            } else {
              timepoint[col] = value;
            }
          });
          
          if (!('SepsisLabel' in timepoint)) {
            timepoint['SepsisLabel'] = 0;
          }
          
          const timestamp = new Date(baseTime);
          timestamp.setHours(baseTime.getHours() - (lines.length - i));
          timepoint.timestamp = timestamp.toISOString();
          
          parsedTimepoints.push(timepoint);
        }
        
        if (parsedTimepoints.length < 10) {
          throw new Error("File must contain at least 10 valid data rows for prediction");
        }
        
        setTimepoints([...timepoints, ...parsedTimepoints]);
        setSuccessMessage(`Successfully added ${parsedTimepoints.length} timepoints from file`);
        setFileUploadInfo(`Imported ${parsedTimepoints.length} timepoints from ${file.name}`);
        setTimeout(() => setSuccessMessage(""), 3000);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        setError(`Error processing file: ${err.message}`);
        setTimeout(() => setError(""), 5000);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError("Error reading file");
      setLoading(false);
      setTimeout(() => setError(""), 5000);
    };
    
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const downloadSampleTemplate = () => {
    const requiredColumns = ['HR', 'O2Sat', 'Temp', 'SBP', 'MAP', 'DBP', 'Resp', 'EtCO2', 'BaseExcess', 'HCO3'];
    const header = requiredColumns.join(',');
    
    let rows = [];
    for (let i = 0; i < 10; i++) {
      const row = [
        75 + Math.random() * 10,             // HR
        97 + Math.random() * 3,              // O2Sat
        (36.8 + Math.random() * 0.6).toFixed(1),   // Temp
        120 + Math.random() * 10,            // SBP
        80 + Math.random() * 5,              // MAP
        70 + Math.random() * 5,              // DBP
        16 + Math.random() * 4,              // Resp
        35 + Math.random() * 3,              // EtCO2
        (0 + Math.random() * 2 - 1).toFixed(1),    // BaseExcess
        (24 + Math.random() * 2 - 1).toFixed(1)    // HCO3
      ].join(',');
      rows.push(row);
    }
    
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'patient_data_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const makePrediction = async () => {
    if (timepoints.length < 10) {
      setError("Need at least 10 timepoints for prediction");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setDebugInfo("Sending prediction request...");
    try {
      const processedTimepoints = timepoints.map(tp => {
        const processed = {};
        Object.keys(tp).forEach(key => {
          if (key === 'timestamp') {
            processed[key] = tp[key];
          } else {
            processed[key] = Number(tp[key]);
          }
        });
        return processed;
      });
      
      setDebugInfo(`Processed timepoints: ${JSON.stringify(processedTimepoints.slice(-1))}`);
      
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientData: processedTimepoints,
          timestamp: new Date().toISOString()
        })
      });

      const responseText = await response.text();
      setDebugInfo(`API Response status: ${response.status}, Response body: ${responseText}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${responseText}`);
      }

      try {
        const result = JSON.parse(responseText);
        setPrediction(result);
      } catch (jsonError) {
        throw new Error(`Failed to parse response: ${responseText}`);
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 10000);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health");
      const result = await response.json();
      setDebugInfo(`API test result: ${JSON.stringify(result)}`);
      setSuccessMessage("API connection successful!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`API connection failed: ${err.message}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  const savePatientData = async () => {
    if (!patientId || timepoints.length === 0) {
      setError("Patient ID and at least one timepoint are required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientData: timepoints
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save patient data");
      }

      const result = await response.json();
      setSuccessMessage("Patient data saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTimepoint({
      ...currentTimepoint,
      [name]: parseFloat(value) || 0
    });
  };

  const clearTimepoints = () => {
    setTimepoints([]);
    setPrediction(null);
    setSuccessMessage("All timepoints cleared");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

const RiskIndicator = ({ prediction }) => {
  if (!prediction) return null;

  let riskLevel = "Low";
  let riskColor = "bg-green-500";
  let textColor = "text-green-800";
  let barWidth = "w-1/3";
  let percentage = (prediction.prediction * 100).toFixed(2);
  
  if (prediction.prediction > 0.85) {
    riskLevel = "High";
    riskColor = "bg-red-500";
    textColor = "text-red-800";
    barWidth = "w-full";
  } else if (prediction.prediction > 0.4) {
    riskLevel = "Medium";
    riskColor = "bg-yellow-500";
    textColor = "text-yellow-800";
    barWidth = "w-2/3";
  }

  return (
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-4">
      <div className="flex items-center mb-3">
        <AlertTriangle className="mr-2 text-orange-600" />
        <div className="font-bold text-lg text-orange-800">Sepsis Risk Assessment</div>
      </div>
      
      {/* Risk Score Display */}
      {/* <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Risk Level:</span>
        <span className={`font-bold ${textColor}`}>{riskLevel} ({percentage}%)</span>
      </div> */}
      
      {/* Risk Bar Graph */}
      <div className="mt-4">
        <div className="flex text-xs mb-1 justify-between">
          <span>Low Risk</span>
          <span>Medium Risk</span>
          <span>High Risk</span>
        </div>
        <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 rounded-l-full flex items-center justify-center w-1/3">
            {riskLevel === "Low"}
          </div>
          <div className="h-full bg-yellow-500 flex items-center justify-center w-1/3">
            {riskLevel === "Medium"}
          </div>
          <div className="h-full bg-red-500 rounded-r-full flex items-center justify-center w-1/3">
            {riskLevel === "High"}
          </div>
        </div>
        
        {/* Active Risk Indicator */}
        <div className="mt-3 flex w-full justify-between">
          <div className={`w-1/3 flex justify-center ${riskLevel === "Low" ? "opacity-100" : "opacity-30"}`}>
            <div className={`h-4 w-4 rounded-full ${riskLevel === "Low" ? "bg-green-500" : "bg-gray-300"}`}></div>
          </div>
          <div className={`w-1/3 flex justify-center ${riskLevel === "Medium" ? "opacity-100" : "opacity-30"}`}>
            <div className={`h-4 w-4 rounded-full ${riskLevel === "Medium" ? "bg-yellow-500" : "bg-gray-300"}`}></div>
          </div>
          <div className={`w-1/3 flex justify-center ${riskLevel === "High" ? "opacity-100" : "opacity-30"}`}>
            <div className={`h-4 w-4 rounded-full ${riskLevel === "High" ? "bg-red-500" : "bg-gray-300"}`}></div>
          </div>
        </div>
      </div>
      
      {/* Clinical Recommendations Based on Risk */}
      <div className="mt-6 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <h4 className="font-medium text-orange-800 mb-2">Clinical Recommendations:</h4>
        {riskLevel === "High" && (
          <ul className="text-sm list-disc pl-5 text-gray-700">
            <li>Immediate clinical evaluation recommended</li>
            <li>Consider blood cultures and lactate measurement</li>
            <li>Early antibiotic therapy if sepsis confirmed</li>
            <li>Monitor vital signs every hour</li>
          </ul>
        )}
        {riskLevel === "Medium" && (
          <ul className="text-sm list-disc pl-5 text-gray-700">
            <li>Clinical evaluation within 1-2 hours</li>
            <li>Increased monitoring of vital signs</li>
            <li>Follow up laboratory tests recommended</li>
            <li>Re-evaluate risk in 4-6 hours</li>
          </ul>
        )}
        {riskLevel === "Low" && (
          <ul className="text-sm list-disc pl-5 text-gray-700">
            <li>Continue standard monitoring protocols</li>
            <li>Re-evaluate if clinical condition changes</li>
            <li>Normal care plan can be maintained</li>
          </ul>
        )}
      </div>
    </div>
  );
  
};

  // Render loading overlay for initial page load
  // Simulate initial loading state
useEffect(() => {
  const timer = setTimeout(() => {
    setInitialLoading(false);
  }, 5000); // Increased from 2000ms to 5000ms
  return () => clearTimeout(timer);
}, []);

// Render loading overlay for initial page load
if (initialLoading) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="p-8 flex flex-col items-center">
        <Loader className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <h1 className="text-xl font-medium text-orange-700">SepsisX</h1>
        <p className="text-gray-500 mt-2">Loading patient monitoring system...</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Platelets background decorations */}
      <div className="fixed w-16 h-16 top-20 left-10 opacity-20">
        <div className="w-4 h-4 bg-orange-400 rounded-full absolute"></div>
        <div className="w-3 h-3 bg-orange-300 rounded-full absolute top-6 left-8"></div>
        <div className="w-5 h-5 bg-orange-500 rounded-full absolute top-10 left-2"></div>
      </div>
      <div className="fixed w-16 h-16 bottom-20 right-10 opacity-20">
        <div className="w-4 h-4 bg-orange-400 rounded-full absolute"></div>
        <div className="w-3 h-3 bg-orange-300 rounded-full absolute top-6 left-8"></div>
        <div className="w-5 h-5 bg-orange-500 rounded-full absolute top-10 left-2"></div>
      </div>

      <header className="bg-gradient-to-r from-orange-700 to-orange-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Activity className="mr-2 w-6 h-6" />
          <h1 className="text-2xl font-bold">SepsisX</h1>
          {/* Platelets logo */}
          <div className="ml-auto relative w-10 h-10">
            <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1 opacity-80"></div>
            <div className="w-2 h-2 bg-white rounded-full absolute top-5 left-3 opacity-70"></div>
            <div className="w-4 h-4 bg-white rounded-full absolute top-4 left-6 opacity-90"></div>
          </div>
        </div>
      </header>

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="relative">
              {/* Small platelets animation during loading */}
              <div className="absolute w-12 h-12 -top-6 -left-6 animate-spin">
                <div className="absolute w-2 h-2 bg-orange-400 rounded-full top-3 left-6"></div>
                <div className="absolute w-2 h-2 bg-orange-300 rounded-full top-7 left-2"></div>
                <div className="absolute w-3 h-3 bg-orange-500 rounded-full top-8 left-8"></div>
              </div>
              <Loader className="w-10 h-10 text-orange-600 animate-spin mb-4" />
            </div>
            <p className="text-orange-800 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 shadow-md">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100">
            <h2 className="text-xl font-semibold mb-4 text-orange-800 flex items-center">
              <Heart className="mr-2 text-orange-600" />
              Patient Information
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Patient ID</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                placeholder="Enter patient ID"
              />
            </div>

            {/* File Upload Section */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-medium mb-3 flex items-center text-orange-800">
                <Upload className="w-5 h-5 mr-2 text-orange-600" />
                Upload Patient Data
              </h3>
              
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">
                  Upload CSV or PSV file with hourly patient data (minimum 10 timepoints)
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={triggerFileUpload}
                    className="bg-orange-600 text-red px-4 py-2 rounded hover:bg-orange-700 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Select File
                  </button>
                  <button
                    onClick={downloadSampleTemplate}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center justify-center shadow-sm"
                  >
                    Download Template
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.psv"
                  className="hidden"
                />
              </div>
              
              {fileUploadInfo && (
                <div className="mt-2 text-sm text-orange-700 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  {fileUploadInfo}
                </div>
              )}
              
              <div className="mt-3 p-2 bg-white rounded border border-orange-100">
                <h4 className="text-xs font-medium text-gray-600 mb-1">Required columns:</h4>
                <p className="text-xs text-gray-500">
                  HR, O2Sat, Temp, SBP, MAP, DBP, Resp, EtCO2, BaseExcess, HCO3
                </p>
              </div>
            </div>

            <h3 className="font-medium mt-6 mb-4 text-orange-800">Vital Signs Input</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="HR"
                  value={currentTimepoint.HR}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  O2 Saturation (%)
                </label>
                <input
                  type="number"
                  name="O2Sat"
                  value={currentTimepoint.O2Sat}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  <Thermometer className="w-4 h-4 mr-1 text-red-500" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="Temp"
                  value={currentTimepoint.Temp}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  step="0.1"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  name="SBP"
                  value={currentTimepoint.SBP}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  Mean Arterial Pressure
                </label>
                <input
                  type="number"
                  name="MAP"
                  value={currentTimepoint.MAP}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  name="DBP"
                  value={currentTimepoint.DBP}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  Respiration Rate
                </label>
                <input
                  type="number"
                  name="Resp"
                  value={currentTimepoint.Resp}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  End Tidal CO2
                </label>
                <input
                  type="number"
                  name="EtCO2"
                  value={currentTimepoint.EtCO2}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  Base Excess
                </label>
                <input
                  type="number"
                  name="BaseExcess"
                  value={currentTimepoint.BaseExcess}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  step="0.1"
                />
              </div>
              <div>
                <label className="flex items-center text-gray-700 mb-1">
                  Bicarbonate (HCO3)
                </label>
                <input
                  type="number"
                  name="HCO3"
                  value={currentTimepoint.HCO3}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-200 rounded focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  step="0.1"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={addTimepoint}
                className="bg-orange-600 text-red px-4 py-2 rounded hover:bg-orange-700 transition-colors shadow-sm"
              >
                Add Timepoint
              </button><br></br><br></br>
           
              <button
                onClick={clearTimepoints}
                className="bg-red-500 text-red px-4 py-2 rounded hover:bg-red-600 transition-colors shadow-sm"
              >
                Clear All
              </button><br></br><br></br>
              <button
                onClick={makePrediction}
                disabled={timepoints.length < 10 || loading}
                className={`${
                  timepoints.length < 10 || loading
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700 transition-colors"
                } text-red px-4 py-2 rounded shadow-sm`}
              >
                {loading ? "Processing..." : "Predict Sepsis Risk"}
              </button>
            </div>
          </div>

          {/* Results and Visualization */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100">
            <h2 className="text-xl font-semibold mb-4 text-orange-800 flex items-center">
              <BarChart2 className="mr-2 text-orange-600" />
              Results & Visualization
            </h2>
            
            {/* Risk Indicator */}
            {/* Risk Indicator */}
            <RiskIndicator prediction={prediction} />
            
            {/* Timepoints count */}
            <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <p className="text-gray-700 flex items-center">
                <span className="font-medium text-orange-800 mr-2">Timepoints recorded:</span> 
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">{timepoints.length}</span>
                {timepoints.length < 10 && (
                  <span className="text-yellow-600 ml-2 text-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Need at least 10 for prediction
                  </span>
                )}
              </p>
            </div>
            
           
            {/* Platelets visualization decoration */}
            {timepoints.length === 0 && (
              <div className="my-6 flex justify-center opacity-20">
                <div className="relative w-32 h-32">
                  <div className="absolute w-8 h-8 bg-orange-300 rounded-full top-2 left-4"></div>
                  <div className="absolute w-6 h-6 bg-orange-400 rounded-full top-10 left-20"></div>
                  <div className="absolute w-10 h-10 bg-orange-500 rounded-full top-16 left-8"></div>
                  <div className="absolute w-7 h-7 bg-orange-200 rounded-full top-22 left-16"></div>
                </div>
              </div>
            )}
            
            {/* Vital Signs Chart */}
            {timepoints.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2 flex items-center text-orange-800">
                  <BarChart2 className="w-4 h-4 mr-1 text-orange-600" />
                  Vital Signs Trend
                </h3>
                <div className="h-64 p-2 bg-white rounded-lg border border-orange-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timepoints.map((t, i) => ({ ...t, index: i }))} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8e0cb" />
                      <XAxis dataKey="index" label={{ value: 'Timepoint', position: 'insideBottom', offset: -5 }} stroke="#f97316" />
                      <YAxis stroke="#f97316" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          border: '1px solid #fdba74',
                          borderRadius: '6px'
                        }} 
                      />
    
                      <Legend />
                      <Line type="monotone" dataKey="HR" stroke="#ef4444" name="Heart Rate" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                      <Line type="monotone" dataKey="Temp" stroke="#f97316" name="Temperature" strokeWidth={2} dot={{ fill: '#f97316' }} />
                      <Line type="monotone" dataKey="SBP" stroke="#3b82f6" name="Systolic BP" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                      <Line type="monotone" dataKey="Resp" stroke="#10b981" name="Resp Rate" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Blood cell decoration */}
                <div className="flex justify-end mt-2">
                  <div className="relative w-16 h-4">
                    <div className="absolute w-4 h-4 bg-orange-200 rounded-full right-0"></div>
                    <div className="absolute w-3 h-3 bg-orange-300 rounded-full right-4 top-1"></div>
                    <div className="absolute w-2 h-2 bg-orange-400 rounded-full right-8 top-2"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Last 10 Timepoints Table */}
            {timepoints.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2 text-orange-800 flex items-center">
                  <Activity className="w-4 h-4 mr-1 text-orange-600" />
                  Recent Measurements
                </h3>
                <div className="overflow-x-auto bg-orange-50 rounded-lg border border-orange-100 p-2">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-orange-100">
                      <tr>
                        <th className="p-2 text-sm text-orange-800 border-b border-orange-200">Point</th>
                        <th className="p-2 text-sm text-orange-800 border-b border-orange-200">HR</th>
                        <th className="p-2 text-sm text-orange-800 border-b border-orange-200">Temp</th>
                        <th className="p-2 text-sm text-orange-800 border-b border-orange-200">SBP</th>
                        <th className="p-2 text-sm text-orange-800 border-b border-orange-200">O2Sat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timepoints.slice(-10).map((point, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-orange-50" : "bg-white"}>
                          <td className="p-2 text-sm border-b border-orange-100">{timepoints.length - 10 + idx + 1}</td>
                          <td className="p-2 text-sm border-b border-orange-100">{typeof point.HR === 'number' ? point.HR.toFixed(1) : point.HR}</td>
                          <td className="p-2 text-sm border-b border-orange-100">{typeof point.Temp === 'number' ? point.Temp.toFixed(1) : point.Temp}</td>
                          <td className="p-2 text-sm border-b border-orange-100">{typeof point.SBP === 'number' ? point.SBP.toFixed(0) : point.SBP}</td>
                          <td className="p-2 text-sm border-b border-orange-100">{typeof point.O2Sat === 'number' ? point.O2Sat.toFixed(0) : point.O2Sat}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={savePatientData}
                disabled={!patientId || timepoints.length === 0 || loading}
                className={`${
                  !patientId || timepoints.length === 0 || loading
                    ? "bg-gray-400"
                    : "bg-orange-600 hover:bg-orange-700"
                } text-red px-4 py-2 rounded transition-colors shadow-sm flex items-center`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Save Patient Data
              </button>
              
              {prediction && (
                <button 
                  className="bg-blue-600 text-red px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  onClick={() => window.print()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-orange-800 to-orange-700 text-white p-6 mt-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center mb-4">
            {/* Platelets footer decoration */}
            <div className="relative w-8 h-8 mr-2">
              <div className="absolute w-2 h-2 bg-white rounded-full opacity-80"></div>
              <div className="absolute w-3 h-3 bg-white rounded-full top-3 left-4 opacity-70"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full top-6 left-1 opacity-90"></div>
            </div>
            <p className="font-bold">SepsisX- An Early Sepsis Prediction System</p>
            <div className="relative w-8 h-8 ml-2">
              <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-3 opacity-80"></div>
              <div className="absolute w-3 h-3 bg-white rounded-full top-4 opacity-70"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full top-6 left-5 opacity-90"></div>
            </div>
          </div>
          <p className="text-sm mt-1 text-orange-200">
            This is a clinical decision support tool. Always use clinical judgment.
          </p>
          <div className="mt-4 text-xs text-orange-300">
            © 2025 SepsisX | Version 2.1.0
          </div>
        </div>
      </footer>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
