// src/TeamSelector.js
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb } from 'pdf-lib';
import './teamselector.css'; 

const TeamSelector = () => {
  const [data, setData] = useState({
    devs: [],
    bas: [],
    das: [],
  });

  const [teams, setTeams] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const devs = [];
        const bas = [];
        const das = [];
        
        jsonData.forEach(row => {
          if (row.Dev) devs.push(row.Dev);
          if (row.BA) bas.push(row.BA);
          if (row['Data Analyst']) das.push(row['Data Analyst']);
        });

        setData({ devs, bas, das });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const generateRandomTeams = () => {
    const { devs, bas, das } = data;

    if (devs.length < 15 || bas.length < 5 || das.length < 5) {
      alert('Not enough data to generate 5 teams.');
      return;
    }

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const teamsArray = [];

    for (let i = 0; i < 5; i++) {
      const team = {
        devs: [],
        ba: '',
        da: ''
      };

      while (team.devs.length < 3) {
        const dev = getRandomElement(devs);
        if (!team.devs.includes(dev)) {
          team.devs.push(dev);
        }
      }

      team.ba = getRandomElement(bas);
      team.da = getRandomElement(das);

      teamsArray.push(team);
    }

    setTeams(teamsArray);
  };

  const generatePDF = async () => {
  if (teams.length === 0) {
    alert('No teams to generate PDF.');
    return;
  }

  const baseHeight = 400;
  const additionalHeightPerTeam = 100;
  const pageHeight = baseHeight + (additionalHeightPerTeam * teams.length);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, pageHeight]);
  const { width, height } = page.getSize();

  page.drawText('Selected Teams:', {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0, 0, 0),
  });

  let yOffset = 100;
  teams.forEach((team, index) => {
    page.drawText(`Team ${index + 1}:`, { x: 50, y: height - yOffset, size: 20, color: rgb(0, 0, 0) });
    yOffset += 30;
    page.drawText(`Developers: ${team.devs.join(', ')}`, { x: 50, y: height - yOffset, size: 18 });
    page.drawText(`Business Analyst: ${team.ba}`, { x: 50, y: height - yOffset - 30, size: 18 });
    page.drawText(`Data Analyst: ${team.da}`, { x: 50, y: height - yOffset - 60, size: 18 });
    yOffset += 100;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'team-selection.pdf';
  link.click();
};

  return (
    <div className="container">
      {/* <h1>Team Selector</h1> */}
      <input 
        type="file" 
        accept=".xlsx" 
        onChange={handleFileUpload} 
        className="file-upload"
      />
      <button 
        onClick={generateRandomTeams} 
        className="generate-button"
      >
        Generate Teams
      </button>
      {teams.length > 0 && (
        <div className="teams">
          <h3>Selected Teams</h3>
          {teams.map((team, index) => (
            <div key={index} className="team-card">
              <h4>Team {index + 1}:</h4>
              <ul>
                <li><strong>Developers:</strong> {team.devs.join(', ')}</li>
                <li><strong>Business Analyst:</strong> {team.ba}</li>
                <li><strong>Data Analyst:</strong> {team.da}</li>
              </ul>
            </div>
          ))}
          <button 
            onClick={generatePDF} 
            className="pdf-button"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamSelector;
