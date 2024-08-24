'use client';
import React, { useState, useEffect } from 'react';
import { AiOutlineUndo, AiOutlineRedo } from 'react-icons/ai';
import { FiSearch } from 'react-icons/fi';
import { RiFileExcel2Line } from 'react-icons/ri';
import { BiText } from 'react-icons/bi';

const Spreadsheet = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('spreadsheetData');
    return savedData ? JSON.parse(savedData) : Array(1000).fill('');
  });
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [alignment, setAlignment] = useState(Array(1000).fill('text-left'));
  const [fontSize, setFontSize] = useState(Array(1000).fill('text-base'));
  const [textColor, setTextColor] = useState(Array(1000).fill('#000000')); // Default to black
  const [backgroundColor, setBackgroundColor] = useState(Array(1000).fill('#ffffff')); // Default to white
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [mergedCells, setMergedCells] = useState([]);
  const [selectedCells, setSelectedCells] = useState({ start: null, end: null });

  const rowsPerPage = 100;

  useEffect(() => {
    localStorage.setItem('spreadsheetData', JSON.stringify(data));
  }, [data]);

  const handleCellClick = (index) => {
    setEditingCell(index);
    setInputValue(data[index]);

    if (selectedCells.start === null) {
      setSelectedCells({ start: index, end: index });
    } else {
      setSelectedCells({ ...selectedCells, end: index });
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (editingCell === null) return;

    const value = inputValue.trim();
    const newData = [...data];
    const oldValue = newData[editingCell];

    if (value !== oldValue) {
      setHistory([...history, newData]);
      setFuture([]);
      newData[editingCell] = value;
      setData(newData);
    }

    setEditingCell(null);
  };

  const handleAlignmentChange = (align) => {
    const newAlignment = [...alignment];
    newAlignment[editingCell] = align;
    setAlignment(newAlignment);
  };

  const handleFontSizeChange = (size) => {
    const newFontSize = [...fontSize];
    newFontSize[editingCell] = size;
    setFontSize(newFontSize);
  };

  const handleTextColorChange = (color) => {
    if (editingCell === null) return;
    const newTextColor = [...textColor];
    newTextColor[editingCell] = color;
    setTextColor(newTextColor);
  };

  const handleBackgroundColorChange = (color) => {
    if (editingCell === null) return;
    const newBackgroundColor = [...backgroundColor];
    newBackgroundColor[editingCell] = color;
    setBackgroundColor(newBackgroundColor);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousData = history[history.length - 1];
      setFuture([data, ...future]);
      setData(previousData);
      setHistory(history.slice(0, history.length - 1));
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextData = future[0];
      setHistory([...history, data]);
      setData(nextData);
      setFuture(future.slice(1));
    }
  };

  const handleExportCSV = () => {
    const csvContent = data.map((cell) => cell || '').join(',').replace(/,{2,}/g, ',');
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const tempLink = document.createElement('a');
    tempLink.href = csvUrl;
    tempLink.setAttribute('download', 'spreadsheet.csv');
    tempLink.click();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const mergeCells = () => {
    if (selectedCells.start === null || selectedCells.end === null) return;

    const newMergedCells = [...mergedCells];
    newMergedCells.push({ start: selectedCells.start, end: selectedCells.end });
    setMergedCells(newMergedCells);

    // Clear content of merged cells except the first one
    const newData = [...data];
    for (let i = selectedCells.start + 1; i <= selectedCells.end; i++) {
      newData[i] = '';
    }
    setData(newData);

    // Reset selection
    setSelectedCells({ start: null, end: null });
  };

  const unmergeCells = (index) => {
    const newMergedCells = mergedCells.filter(
      merge => !(index >= merge.start && index <= merge.end)
    );
    setMergedCells(newMergedCells);
  };

  const filteredData = searchTerm
    ? data.map((cell) => (cell.includes(searchTerm) ? cell : ''))
    : data;

  return (
    <div className="h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded bg-gray-200 hover:bg-gray-300">
              <RiFileExcel2Line size={20} />
            </button>
            <div className="text-sm font-medium">Untitled spreadsheet</div>
          </div>
          <div className="flex space-x-4 items-center">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="p-2 border rounded-md flex-1"
            />
            <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded">
              <FiSearch size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleUndo} disabled={history.length === 0} className="p-2 bg-gray-200 hover:bg-gray-300 rounded">
              <AiOutlineUndo size={20} />
            </button>
            <button onClick={handleRedo} disabled={future.length === 0} className="p-2 bg-gray-200 hover:bg-gray-300 rounded">
              <AiOutlineRedo size={20} />
            </button>
            <button onClick={handleExportCSV} className="p-2 bg-green-500 text-white rounded">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 shadow-md">
        <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded">
          <BiText size={20} />
        </button>
        <select onChange={(e) => handleFontSizeChange(e.target.value)} className="p-2 border rounded">
          <option value="text-base">Base</option>
          <option value="text-lg">Large</option>
          <option value="text-xl">Extra Large</option>
        </select>
        <input
          type="color"
          onChange={(e) => handleTextColorChange(e.target.value)}
          title="Text Color"
          className="p-2 border rounded"
        />
        <input
          type="color"
          onChange={(e) => handleBackgroundColorChange(e.target.value)}
          title="Background Color"
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-10 gap-1 p-4 bg-white shadow-md">
        {filteredData.map((cell, index) => {
          const isMerged = mergedCells.find(
            merge => index >= merge.start && index <= merge.end
          );

          const colSpan = isMerged ? isMerged.end - isMerged.start + 1 : 1;

          if (isMerged && index !== isMerged.start) {
            return null; // Skip rendering cells that are part of a merge but not the start cell
          }

          return (
            <div
              key={index}
              className={`border p-2 text-center ${alignment[index]} ${fontSize[index]}`}
              onClick={() => handleCellClick(index)}
              style={{
                gridColumn: `span ${colSpan}`,
                color: textColor[index],
                backgroundColor: backgroundColor[index],
                borderColor: cell.includes(searchTerm) && searchTerm ? '#FFFF00' : '#E5E7EB',
              }}
            >
              {editingCell === index ? (
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  autoFocus
                  className="w-full h-full border-none outline-none"
                  style={{
                    color: textColor[index],
                    backgroundColor: backgroundColor[index],
                  }}
                />
              ) : (
                <span>
                  {cell}
                  {isMerged && (
                    <button
                      onClick={() => unmergeCells(index)}
                      className="ml-2 text-red-500"
                    >
                      Unmerge
                    </button>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center p-4">
        <button
          onClick={mergeCells}
          disabled={selectedCells.start === null || selectedCells.end === null}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Merge Selected Cells
        </button>
      </div>
    </div>
  );
};

export default Spreadsheet;
