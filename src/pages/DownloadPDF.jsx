// Taskflow/client/src/components/DownloadOptions.jsx (continued)
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadPDF = ({ filename = "document" }) => {
  // Create a ref to the HTML element you want to convert to PDF
  const contentRef = useRef(null); // Attach this ref to your table/content HTML element

  const handleDownload = async () => {
    if (!contentRef.current) {
      console.error("Content reference not found for PDF export.");
      return;
    }

    const input = contentRef.current;

    // Use html2canvas to render the HTML element as a canvas
    const canvas = await html2canvas(input, {
      scale: 2, // Increase scale for better quality PDF
      useCORS: true, // If you have images from other domains
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for units, 'a4' for page size

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multiple pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  };

  return (
    <div>
      {/* This is the content you want to export. 
        Wrap your table or desired content with the ref.
      */}
      <div ref={contentRef} style={{ padding: '20px', background: 'white' }}>
        <h2>Task List Report</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Task ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Task Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Due Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.taskName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.category}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.dueDate}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleDownload} className="btn btn-danger" style={{ marginTop: '20px' }}>
        Download PDF
      </button>
    </div>
  );
};

export default DownloadPDF; // If this is a standalone component