import React from 'react';
import { Dropdown, Button, Form, Row, Col } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const TableControls = ({ 
  // Pagination props
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  
  // Search props
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  
  // Download props
  onDownloadPDF,
  onDownloadExcel,
  onDownloadCSV,
  dataType = 'data',
  
  // Bulk actions
  selectedCount = 0,
  onBulkDelete,
  showBulkActions = false,
  bulkEntityName = 'items',
  
  // Additional actions
  additionalActions,
  showPerPage = true,
  showDownload = true,
  showSearch = true,
  
  // Styling
  className = ''
}) => {
  
  // Pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline-dark"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ minWidth: '80px' }}
      >
        ← Previous
      </Button>
    );
    
    // Page numbers (show limited range)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "dark" : "outline-dark"}
          size="sm"
          onClick={() => onPageChange(i)}
          style={{ minWidth: '40px' }}
        >
          {i}
        </Button>
      );
    }
    
    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline-dark"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ minWidth: '80px' }}
      >
        Next →
      </Button>
    );
    
    return buttons;
  };

  return (
    <div className={`table-controls ${className}`}>
      {/* Main Controls Row */}
      <Row className="align-items-center mb-3">
        {/* Left Side: Search */}
        {showSearch && (
          <Col  >
            <div className="d-flex align-items-center">
              <Form.Control
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
                style={{ 
                  height: '40px',
                  borderRadius: '0px',border:"2px solid #000000"
                }}
              />
            </div>
          </Col>
        )}
        {/* Right Side: Controls */}
        <Col >
          <div className="d-flex align-items-center justify-content-end gap-2">
            {/* Items per page dropdown */}
            {showPerPage && (
              <Dropdown className="me-2">
                <Dropdown.Toggle 
                  variant="outline-dark" 
                  size="sm"
                  style={{ minWidth: '120px' }}
                >
                  {itemsPerPage} per page
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onItemsPerPageChange(5)}>5 per page</Dropdown.Item>
                  <Dropdown.Item onClick={() => onItemsPerPageChange(10)}>10 per page</Dropdown.Item>
                  <Dropdown.Item onClick={() => onItemsPerPageChange(15)}>15 per page</Dropdown.Item>
                  <Dropdown.Item onClick={() => onItemsPerPageChange(20)}>20 per page</Dropdown.Item>
                  <Dropdown.Item onClick={() => onItemsPerPageChange(50)}>50 per page</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
            
            {/* Download buttons */}
            {showDownload && (
              <div className="d-flex gap-1">
                <Button 
                  variant="outline-light" style={{border:"1px solid #000000"}}
                  size="sm"
                  onClick={onDownloadPDF}
                  title="Download as PDF"
                >
                  <FaFilePdf className="text-danger" />
                </Button>
                <Button 
                  variant="outline-light" style={{border:"1px solid #000000"}}
                  size="sm"
                  onClick={onDownloadExcel}
                  title="Download as Excel"
                >
                  <FaFileExcel className="text-success" />
                </Button>
                <Button 
                  variant="outline-light"style={{border:"1px solid #000000"}}
                  size="sm"
                  onClick={onDownloadCSV}
                  title="Download as CSV"
                >
                  <FaFileCsv className="text-primary" />
                </Button>
              </div>
            )}
            
            {/* Additional actions */}
            {additionalActions && (
              <div className="ms-2">
                {additionalActions}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Bulk Actions Section */}
      {showBulkActions && selectedCount > 0 && (
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
              <span className="fw-medium">
                {selectedCount} {bulkEntityName} selected
              </span>
              <Button 
                variant="danger" 
                size="sm"
                onClick={onBulkDelete}
              >
                <i className="bi bi-trash me-2"></i>Delete Selected
              </Button>
            </div>
          </Col>
        </Row>
      )}

    </div>
  );
};

// Helper functions for downloads (can be imported from utilities)
export const downloadTableAsPDF = (element, dataType = '') => {
  if (!element) {
    alert('No table found to download');
    return;
  }
  
  const options = {
    margin: 1,
    filename: `${dataType || 'table'}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  html2pdf().from(element).set(options).save();
};

export const downloadTableAsExcel = (data, headers, dataType = '') => {
  if (data.length === 0) {
    alert('No data available to export');
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  XLSX.writeFile(workbook, `${dataType || 'data'}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const downloadTableAsCSV = (data, headers, dataType = '') => {
  if (data.length === 0) {
    alert('No data available to export');
    return;
  }
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataType || 'data'}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default TableControls;