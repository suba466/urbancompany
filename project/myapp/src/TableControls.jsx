// TableControls.js - Responsive version
import React from 'react';
import { Dropdown, Button, Form, Row, Col } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

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
      {/* Mobile View - Stacked layout */}
      <div className="d-block d-md-none">
        {/* Row 1: Search */}
        {showSearch && (
          <div className="mb-3">
            <div className="position-relative">
              <Form.Control
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
                style={{
                  height: '40px',
                  borderRadius: '0px',
                  border: "2px solid #000000",
                  paddingLeft: '40px'
                }}
              />
              <FaSearch
                className="position-absolute"
                style={{
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d'
                }}
              />
            </div>
          </div>
        )}

        {/* Row 2: Additional Actions */}
        {additionalActions && (
          <div className="mb-3">
            {additionalActions}
          </div>
        )}

        {/* Row 3: Items per page + Pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Items per page dropdown */}
          {showPerPage && (
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-dark"
                size="sm"
                style={{ minWidth: '100px' }}
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

          {/* Pagination Controls */}
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
              {totalPages > 1 && (
                <span className="mx-2 d-none d-sm-inline">
                  Page {currentPage} of {totalPages}
                </span>
              )}
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
        </div>

        {/* Row 4: Download buttons */}
        {showDownload && (
          <div className="d-flex gap-2 justify-content-center mb-3">
            <Button
              variant="outline-light"
              style={{ border: "1px solid #000000", flex: 1 }}
              size="sm"
              onClick={onDownloadPDF}
              title="Download as PDF"
            >
              <FaFilePdf className="text-danger" /> <span className="d-none d-sm-inline">PDF</span>
            </Button>
            <Button
              variant="outline-light"
              style={{ border: "1px solid #000000", flex: 1 }}
              size="sm"
              onClick={onDownloadExcel}
              title="Download as Excel"
            >
              <FaFileExcel className="text-success" /> <span className="d-none d-sm-inline">Excel</span>
            </Button>
            <Button
              variant="outline-light"
              style={{ border: "1px solid #000000", flex: 1 }}
              size="sm"
              onClick={onDownloadCSV}
              title="Download as CSV"
            >
              <FaFileCsv className="text-primary" /> <span className="d-none d-sm-inline">CSV</span>
            </Button>
          </div>
        )}
      </div>

      {/* Desktop View - Grid layout */}
      <div className="d-none d-md-block">
        {/* Main Controls Row */}
        {/* Desktop View - Single Line Toolbar */}
        <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
          {/* Left Side: Actions + Search */}
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            {/* Additional Actions */}
            {additionalActions && (
              <div className="d-flex align-items-center">
                {additionalActions}
              </div>
            )}

            {/* Search Bar - Flexible width */}
            {showSearch && (
              <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <Form.Control
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={onSearchChange}
                  style={{
                    height: '40px',
                    borderRadius: '0px',
                    border: "2px solid #000000",
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Side: Download Buttons - Fixed width, no wrap */}
          {showDownload && (
            <div className="d-flex gap-2 flex-shrink-0">
              <Button
                variant="outline-light"
                style={{ border: "1px solid #000000" }}
                size="sm"
                onClick={onDownloadPDF}
                title="Download as PDF"
              >
                <FaFilePdf size={16} color="red" />
              </Button>
              <Button
                variant="outline-light"
                style={{ border: "1px solid #000000" }}
                size="sm"
                onClick={onDownloadExcel}
                title="Download as Excel"
              >
                <FaFileExcel className="text-success" />
              </Button>
              <Button
                variant="outline-light"
                style={{ border: "1px solid #000000" }}
                size="sm"
                onClick={onDownloadCSV}
                title="Download as CSV"
              >
                <FaFileCsv className="text-primary" />
              </Button>
            </div>
          )}
        </div>

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
            {/* Pagination Controls */}
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
    </div>
  );
};

export default TableControls;
