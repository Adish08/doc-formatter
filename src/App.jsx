import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileCheck, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file) => {
    setIsProcessing(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Skip first 5 metadata rows
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 5 });

          if (jsonData.length === 0) {
            throw new Error("The Excel file is empty.");
          }

          const restructuredData = [];

          jsonData.forEach((row) => {
            const accountName = row['Account'] || row['Account Name'] || '';
            const balance = row['Balance'] !== undefined ? row['Balance'] : 0;

            // Skip aggregate rows and rows with no account name
            if (!accountName || /total|subtotal/i.test(String(accountName))) {
              return;
            }

            // Extract specifically from 'Mobile No.' column
            const mobileVal = row['Mobile No.'];
            const mobileNumbers = [];

            if (mobileVal !== null && mobileVal !== undefined && mobileVal !== '') {
              // Split by comma or semicolon
              const parts = String(mobileVal).split(/[,;]/);
              parts.forEach(part => {
                // Clean: remove non-numeric characters
                let cleanNum = part.replace(/\D/g, '');
                
                // Validate Indian Mobile: ^(\+91|91|0)?[6789]\d{9}$
                if (/^[6789]\d{9}$/.test(cleanNum)) {
                  mobileNumbers.push('91' + cleanNum);
                } else if (/^0[6789]\d{9}$/.test(cleanNum)) {
                  mobileNumbers.push('91' + cleanNum.substring(1));
                } else if (/^91[6789]\d{9}$/.test(cleanNum)) {
                  mobileNumbers.push(cleanNum);
                }
              });
            }

            if (mobileNumbers.length > 0) {
              // Repeat balance for every mobile number row
              mobileNumbers.forEach((num) => {
                restructuredData.push({
                  'phone': num,
                  'first_name': accountName,
                  'last_name': '',
                  'birthday_date': '',
                  'anniversary_date': '',
                  'address': '',
                  'value1': balance,
                  'value2': '',
                  'value3': '',
                  'value4': '',
                  'value5': ''
                });
              });
            }
          });

          // Create new workbook
          const newSheet = XLSX.utils.json_to_sheet(restructuredData);
          const newWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Restructured Data");

          // Generate download with current date in DD_MM_YY format
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = String(now.getFullYear()).slice(-2);
          const outputFilename = `Payment_Reminder_${day}_${month}_${year}.csv`;
          XLSX.writeFile(newWorkbook, outputFilename);

          setStatus({ type: 'success', message: `Success! File saved as ${outputFilename}` });
        } catch (err) {
          setStatus({ type: 'error', message: `Error processing data: ${err.message}` });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setStatus({ type: 'error', message: "Error reading file." });
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      setStatus({ type: 'error', message: `Initialization error: ${err.message}` });
      setIsProcessing(false);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processFile(file);
      } else {
        setStatus({ type: 'error', message: "Please upload a valid Excel file (.xlsx or .xls)" });
      }
    }
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center transition-all duration-300">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">BusyBMS Template Formatter</h1>
        <p className="text-slate-500 mb-10">Format payment reminders for Meta message template.</p>

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative group cursor-pointer transition-all duration-500 ease-in-out
            aspect-square max-w-[320px] mx-auto rounded-full flex flex-col items-center justify-center
            border-4 border-dashed 
            ${isDragging 
              ? 'border-orange-500 bg-orange-50/50 shadow-[0_0_30px_rgba(249,115,22,0.4)] scale-105' 
              : 'border-slate-200 hover:border-orange-400 hover:bg-slate-50'
            }
          `}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={onFileChange}
          />

          <div className={`p-6 rounded-full transition-all duration-500 ${isDragging ? 'bg-orange-100' : 'bg-slate-100'}`}>
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            ) : (
              <Upload className={`w-12 h-12 transition-colors duration-300 ${isDragging ? 'text-orange-600' : 'text-slate-400'}`} />
            )}
          </div>
          
          <div className="mt-6">
            <p className={`font-semibold transition-colors duration-300 ${isDragging ? 'text-orange-700' : 'text-slate-600'}`}>
              {isDragging ? 'Drop to process' : 'Drag file here'}
            </p>
            <p className="text-sm text-slate-400 mt-1">or click to browse</p>
          </div>

          {/* Dash ring pattern animation placeholder */}
          <div className={`absolute inset-[-8px] rounded-full border border-orange-200 opacity-0 transition-opacity duration-500 ${isDragging ? 'opacity-100 scale-110 animate-pulse' : ''}`} />
        </div>

        <div className="mt-10 h-12">
          {status.type === 'success' && (
            <div className="flex items-center justify-center gap-2 text-orange-600 animate-in fade-in slide-in-from-top-2 duration-300">
              <FileCheck className="w-5 h-5" />
              <span className="font-medium">{status.message}</span>
            </div>
          )}
          {status.type === 'error' && (
            <div className="flex items-center justify-center gap-2 text-rose-500 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{status.message}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Supports .xlsx and .xls files.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
