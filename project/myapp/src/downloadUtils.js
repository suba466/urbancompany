import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import API_URL from './config';

export const getTableElement = (selector = '.table-responsive') => {
  return document.querySelector(selector);
};

export const prepareUserDataForExport = (users) => {
  return users.map(u => ({
    'Name': u.name,
    'Email': u.email,
    'Phone': u.phone,
    'Designation': u.designation,
    'Profile Image': u.profileImage ? `${API_URL}${u.profileImage}` : 'No Image',
    'Permissions': Object.entries(u.permissions || {})
      .filter(([key, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ')
  }));
};

export const prepareCustomerDataForExport = (customers) => {
  return customers.map(c => ({
    'Name': c.name,
    'Email': c.email,
    'Phone': c.phone,
    'City': c.city,
    'Profile Image': c.profileImage ? `${API_URL}${c.profileImage}` : 'No Image',
    'Joined Date': new Date(c.createdAt).toLocaleDateString()
  }));
};

export const prepareBookingDataForExport = (bookings) => {
  return bookings.map(b => ({
    'Customer': b.customerName,
    'Email': b.customerEmail,
    'Profile Image': b.customerProfileImage ? `${API_URL}${b.customerProfileImage}` : 'No Image',
    'Service': b.serviceName,
    'Price': `₹${b.servicePrice}`,
    'Status': b.status,
    'Date': new Date(b.createdAt).toLocaleDateString()
  }));
};

export const getCSVHeadersFromData = (data) => {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
};

export const exportAsPDF = (element, filename = 'export') => {
  const options = {
    margin: 1,
    filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(element).set(options).save();
};

export const generatePDFReportHTML = (title, headers, data) => {
  let html = `<h2 style="text-align: center; margin-bottom: 20px;">${title}</h2>`;
  html += `<p style="text-align: center; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</p>`;
  html += '<table style="width:100%; border-collapse: collapse; font-size: 10px;">';

  // Headers
  html += '<thead><tr>';
  headers.forEach(h => {
    let style = "border:1px solid #ddd; padding: 6px; background-color: #f2f2f2; text-align: center;";
    if (!h.includes('Image') && !h.includes('Profile')) {
      style = "border:1px solid #ddd; padding: 6px; background-color: #f2f2f2; text-align: left;";
    }
    html += `<th style="${style}">${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Rows
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      const value = row[h];
      let cellContent = value || '-'; // Default key for empty cells
      let style = "border:1px solid #ddd; padding: 6px; text-align: left;";

      if (h.includes('Image') || h.includes('Profile')) {
        style = "border:1px solid #ddd; padding: 6px; text-align: center;";
        if (value && value !== 'No Image') {
          // Check if it's a full URL or needs prepending (caller responsibility, but we handle rendering)
          cellContent = `<div style="width: 45px; height: 45px; overflow: hidden; border: 1px solid #dee2e6; margin: 0 auto; ${h.includes('Profile') ? 'border-radius: 50%;' : 'border-radius: 4px;'}">
              <img src="${value}" style="width: 100%; height: 100%; object-fit: cover;" onError="this.style.display='none'"/>
           </div>`;
        } else if (h.includes('Profile')) {
          // Fallback for profile
          const name = row['Name'] || row['Customer Name'] || row['Customer'] || 'User';
          cellContent = `<div style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; border: 1px solid #dee2e6; margin: 0 auto;">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128" style="width: 100%; height: 100%; object-fit: cover;" />
           </div>`;
        } else {
          cellContent = '<span style="color: #ccc;">No Image</span>';
        }
      }

      html += `<td style="${style}">${cellContent}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';

  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

export const exportAsExcel = (data, filename = 'export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportAsCSV = (data, headers, filename = 'export') => {
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};