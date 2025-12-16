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
  
  // Additional actions
  additionalActions,
  showPerPage = true,
  showDownload = true,
  showSearch = true,
  showPagination = true, // NEW: control whether to show pagination
  
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
        {/* Left Side: Search */}
        {showSearch && (
          <Col md={9}>
            <div className="d-flex align-items-center">
              <Form.Control
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
                style={{ 
                  height: '40px', 
                  width: "500px",
                  borderRadius: '0px',
                  border: "2px solid #000000"
                }}
              />
            </div>
          </Col>
        )}
        {/* Right Side: Controls */}
        <Col>
          <div>
            {/* Download buttons */}
            {showDownload && (
              <div className="d-flex gap-2">
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
            
            {/* Additional actions */}
            {additionalActions && (
              <div className="ms-2">
                {additionalActions}
              </div>
            )}
          </div>
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
                  border: "0px", // Changed from 0px to 1px solid
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
                  border: "0px", // Changed from 0px to 1px solid
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