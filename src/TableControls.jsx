// TableControls.js - Updated version
import React from 'react';
import { Dropdown, Button, Form, Row, Col } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const TableControls = ({ 
  // Pagination props
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  
  // Search props
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  
  // Download props
  onDownloadPDF,
  onDownloadExcel,
  onDownloadCSV,
  
  // Additional actions - will appear on LEFT side
  additionalActions,
  showPerPage = true,
  showDownload = true,
  showSearch = true,
  showPagination = true, 
  
  // Styling
  className = ''
}) => {
  
  // Handle next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Handle previous page
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className={`table-controls ${className}`}>
      {/* Main Controls Row */}
      <Row className="align-items-center mb-3">
        {/* Left Side: Search and Additional Actions */}
        <Col md={9}>
          <div className="d-flex align-items-center gap-3">
            {/* Additional Actions (on LEFT of search) */}
            {additionalActions && (
              <div className="additional-actions">
                {additionalActions}
              </div>
            )}
            
            {/* Search Bar */}
            {showSearch && (
              <div className="flex-grow-1">
                <Form.Control
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={onSearchChange}
                  style={{ 
                    height: '40px', 
                    borderRadius: '0px',
                    border: "2px solid #000000"
                  }}
                />
              </div>
            )}
          </div>
        </Col>
        
        {/* Right Side: Download buttons */}
        <Col>
          {showDownload && (
            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="outline-light" 
                style={{border:"1px solid #000000"}}
                size="sm"
                onClick={onDownloadPDF}
                title="Download as PDF"
              >
                <FaFilePdf className="text-danger" />
              </Button>
              <Button 
                variant="outline-light" 
                style={{border:"1px solid #000000"}}
                size="sm"
                onClick={onDownloadExcel}
                title="Download as Excel"
              >
                <FaFileExcel className="text-success" />
              </Button>
              <Button 
                variant="outline-light"
                style={{border:"1px solid #000000"}}
                size="sm"
                onClick={onDownloadCSV}
                title="Download as CSV"
              >
                <FaFileCsv className="text-primary" />
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Second Row: Items per page and Pagination */}
      <Row className='d-flex justify-content-end align-items-center'>
        <Col xs="auto">
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
        </Col>
        <Col xs="auto">
          {/* Pagination Controls with Arrows - Always show if showPagination is true */}
          {showPagination && (
            <div className="d-flex align-items-center gap-1">
              <Button
                variant="outline-dark"
                size="sm" 
                disabled={currentPage <= 1}
                onClick={handlePrev}
                style={{ 
                  border: "0px",
                  fontSize: "15px",
                  minWidth: '36px'
                }}
                title="Previous Page"
              >
                <IoIosArrowBack />
              </Button>
              <Button
                variant="outline-dark"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={handleNext}
                style={{ 
                  border: "0px",
                  fontSize: "15px",
                  minWidth: '36px'
                }}
                title="Next Page"
              >
                <IoIosArrowForward />
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TableControls;