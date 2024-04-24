const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Mock user data
const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
  // Add more user data as needed
};

// Function to generate QR code image
async function generateQRCode(text, options = {}) {
  try {
    // Generate QR code as a data URI
    const qrDataURI = await QRCode.toDataURL(text, options);
    return qrDataURI;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Function to create PDF document and attach QR code image
function createPDFWithQRCodeAndData(qrDataURI, pdfFilePath, userData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();

      // Create write stream to save the PDF
      const writeStream = fs.createWriteStream(pdfFilePath);

      // Pipe PDF document to write stream
      doc.pipe(writeStream);

      // Add user data to table in PDF
      const tableX = 50;
      const tableY = 50;
      const cellPadding = 10;
      const headerHeight = 20;
      const rowHeight = 20;
      const cellWidth = 200;
      const headerKeys = Object.keys(userData);
      const headerValues = Object.values(userData);

      doc.font('Helvetica-Bold').text('User Data:', tableX, tableY);
      doc.font('Helvetica').text('', tableX, tableY + headerHeight);

      headerKeys.forEach((key, index) => {
        const x = tableX + (cellWidth + cellPadding) * index;
        doc.font('Helvetica-Bold').text(key, x, tableY + headerHeight);
      });

      headerValues.forEach((value, index) => {
        const x = tableX + (cellWidth + cellPadding) * index;
        doc.font('Helvetica').text(value.toString(), x, tableY + headerHeight + rowHeight);
      });

      // Add spacing between table and QR code
      doc.moveDown();

      // Embed QR code image in PDF
      doc.image(qrDataURI, { width: 200 });

      // End PDF document
      doc.end();

      // Event listener for when the write stream finishes writing
      writeStream.on('finish', () => {
        resolve(pdfFilePath);
      });

      // Event listener for errors that occur during writing
      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Main function to generate QR code, create PDF, and attach QR code to PDF
async function generatePDFWithQRCodeAndData() {
  try {
    const qrDataURI = await generateQRCode('https://example.com');
    const pdfFilePath = 'document_with_qr_and_data.pdf';
    await createPDFWithQRCodeAndData(qrDataURI, pdfFilePath, mockUserData);
    console.log('PDF with QR code and data generated successfully:', pdfFilePath);
  } catch (error) {
    console.error('Error generating PDF with QR code and data:', error);
  }
}

// Execute main function
generatePDFWithQRCodeAndData();
