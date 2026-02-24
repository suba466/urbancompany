// downloadUtils.js
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

export const getTableElement = (selector = '.table-responsive') => {
  return document.querySelector(selector);
};

export const prepareUserDataForExport = (users) => {
  return users.map(u => ({
    'Name': u.name,
    'Email': u.email,
    'Phone': u.phone,
    'Designation': u.designation,
    'Profile Image': u.profileImage ? `http://localhost:5000${u.profileImage}` : 'No Image',
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
    'Profile Image': c.profileImage ? `http://localhost:5000${c.profileImage}` : 'No Image',
    'Joined Date': new Date(c.createdAt).toLocaleDateString()
  }));
};

const calculateBookingTotal = (booking) => {
  let subtotal = 0;

  // Calculate subtotal from items (matches AccountModal logic)
  if (booking.cartItems && booking.cartItems.length > 0) {
    booking.cartItems.forEach(item => {
      const itemPrice = Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const count = item.count || item.quantity || 1;
      subtotal += itemPrice * count;
    });
  } else if (booking.items && booking.items.length > 0) {
    booking.items.forEach(item => {
      const itemPrice = Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const quantity = item.quantity || 1;
      subtotal += itemPrice * quantity;
    });
  } else {
    // Fallback
    subtotal = Number(booking.originalPrice?.toString().replace(/[^0-9.-]+/g, "")) ||
      Number(booking.servicePrice?.toString().replace(/[^0-9.-]+/g, "")) || 0;
  }

  // Force 6.8% tax calculation to match Cart logic
  const tax = Math.round(subtotal * 0.068);
  const tip = Number(booking.tipAmount) || 0;
  const slotCharge = Number(booking.slotExtraCharge) || 0;

  return subtotal + tax + tip + slotCharge;
};

export const prepareBookingDataForExport = (bookings) => {
  return bookings.map(b => ({
    'Customer': b.customerName,
    'Email': b.customerEmail,
    'Profile Image': b.customerProfileImage ? `http://localhost:5000${b.customerProfileImage}` : 'No Image',
    'Service': b.serviceName,
    'Price': `₹${calculateBookingTotal(b).toLocaleString('en-IN')}`,
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
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(options).save();
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