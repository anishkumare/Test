import React, { useState, useEffect } from 'react';
import './ImportExport.css';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ImportExportTable = () => {
  const [data, setData] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDataFromAPI = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const result = await response.json();
      const formattedData = result.map(user => ({
        name: user.name,
        mobileNumber: user.phone,
        dob: new Date().toISOString().split('T')[0]
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const importedData = result.data.map(item => ({
            name: item.name,
            mobileNumber: item.mobileNumber,
            dob: item.dob
          }));
          setData(importedData);
        },
        error: (error) => {
          console.error('Error parsing CSV file:', error);
        }
      });
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    setFileData(blob);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    setFileData(blob);
    saveAs(blob, 'data_export.xlsx');
  };

  const downloadFile = () => {
    if (fileData) {
      saveAs(fileData, 'data_export.' + (fileData.type === 'text/csv;charset=utf-8;' ? 'csv' : 'xlsx'));
    }
  };

  useEffect(() => {
    fetchDataFromAPI();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(data.length / itemsPerPage)));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="container">
      <div className="button-container">
        <input type="file" onChange={handleFileUpload} accept=".csv" className="file-input" />
        <div className="center-buttons">
          <button onClick={exportToCSV} className="export-button">Export to CSV</button>
          <button onClick={exportToExcel} className="export-button">Export to Excel</button>
        </div>
        <button onClick={downloadFile} className="download-button">Download</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Date of Birth</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.mobileNumber}</td>
              <td>{item.dob}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {Math.ceil(data.length / itemsPerPage)}</span>
        <button onClick={handleNextPage} disabled={currentPage === Math.ceil(data.length / itemsPerPage)}>Next</button>
      </div>
    </div>
  );
};

export default ImportExportTable;
