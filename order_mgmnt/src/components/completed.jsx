import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment'; // To handle date formatting
import * as XLSX from 'xlsx'; // Import xlsx for Excel file generation
import { BsDownload } from 'react-icons/bs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Completed = () => {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD')); // Default to today
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));     // Default to today
  const [orderId, setOrderId] = useState(null); // Initialize orderId state
  const [showImageModal, setShowImageModal] = useState(false); // For controlling image modal
  const [selectedImage, setSelectedImage] = useState('');      // For selected image
  


  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Fetch orders with date range (default: today's date)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://137.184.75.176:5000/completedList?search=${search}`, {
          params: {
            fromDate: fromDate,  // Pass the selected date range
            toDate: toDate,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [fromDate, toDate,search]); // Trigger fetching when dates change
  

  // Handle order collapse
  const handleOrderClick = (orderNumber, order_Id) => {
    setOpenOrder(openOrder === orderNumber ? null : orderNumber);
    setOrderId(order_Id);
  };

  // Function to handle date changes
  const handleDateChange = (e) => {
    if (e.target.name === 'fromDate') {
      setFromDate(e.target.value);
    } else {
      setToDate(e.target.value);
    }
  };

  const downloadPDF = () => {
    // Initialize jsPDF
    const doc = new jsPDF();
  
    // Define the title of the PDF
    doc.setFontSize(18);
    doc.text('Completed Orders', 14, 22);
  
    // Define the column headers
    const headers = [
      'ID',
      'Order Number',
      'Client Name',
      'Client Phone',
      'Client Gmail',
      'Order Status',
      'Order Method',
      'Job Type',
      'Due Date',
      'Garment PO',
      'Tracking Number',
      'Shipping Address',
      'Garment Details',
      'Team',
      'Notes',
      'Created At',
      'Files',
    ];
  
    // Prepare the data rows
    const data = orders.map((order) => [
      order.id,
      order.orderNumber,
      order.clientName,
      order.clientPhone,
      order.clientgmail,
      order.orderStatus,
      order.orderMethod,
      order.jobType,
      moment(order.dueDate).format('MM/DD/YYYY'),
      order.garmentPO,
      order.trackingLabel,
      order.shippingAddress,
      order.garmentDetails,
      order.team,
      order.notes,
      moment(order.createdAt).format('MM/DD/YYYY'),
      order.files && order.files.length > 0
        ? order.files.map((file) => file.fileUrl).join(', ')
        : 'No files uploaded',
    ]);
  
    // Add AutoTable to the PDF
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 30, // Starting Y position on the PDF
      styles: { fontSize: 8 }, // Adjust font size as needed
      headStyles: { fillColor: [22, 160, 133] }, // Header background color
      theme: 'striped', // Table theme
      // Add any additional customization here
    });
  
    // Define the file name with the current date
    const fileName = `completed_orders_${moment().format('YYYY-MM-DD')}.pdf`;
  
    // Save the PDF
    doc.save(fileName);
  };
  

  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20, marginBottom: 70 }}>
      <h2>Completed Jobs</h2>

      {/* Date Filter Inputs */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label>From Date:</label>
          <input
            type="date"
            className="form-control"
            name="fromDate"
            value={fromDate}
            onChange={handleDateChange}
          />
        </div>
        <div className="col-md-3">
          <label>To Date:</label>
          <input
            type="date"
            className="form-control"
            name="toDate"
            value={toDate}
            onChange={handleDateChange}
          />
        </div>
        {/* Download Button */}
      
        <div className="col-md-4">
          <label>Search Orders:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search orders... 🔍"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2">
        <Button variant="primary" onClick={downloadExcel}>
          <BsDownload style={{ marginRight: '5px' }} /> {/* Add download icon */}
          Download
        </Button>
        </div>
      </div>

      <table className="table table-striped table-hover">
        <thead className="thead-dark table-header">
          <tr>
            <th scope="col">Order Number</th>
            <th scope="col">Client Name</th>
            <th scope="col">Client Phone</th>
            <th scope="col">Client Gmail</th>
            <th scope="col">Order Status</th>
            <th scope="col">Order Method</th>
            <th scope="col">Job Type</th>
            <th scope="col">Due Date</th>
            <th scope="col">Garment PO</th>
            <th scope="col">Tracking Number</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="order-cell">
                  <i className="bi bi-eye" onClick={() => handleOrderClick(order.orderNumber, order.id)}></i>
                  {order.orderNumber}
                </td>
                <td>{order.clientName}</td>
                <td>{order.clientPhone}</td>
                <td>{order.clientgmail}</td>
                <td>{order.orderStatus}</td>
                <td>{order.orderMethod}</td>
                <td>{order.jobType}</td>
                <td>{new Date(order.dueDate).toLocaleDateString('en-US')}</td>
                <td>{order.garmentPO}</td>
                <td>{order.trackingLabel}</td>
              </tr>
              <tr>
                <td colSpan="6">
                  <Collapse in={openOrder === order.orderNumber}>
                    <div>
                      <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                      <p><strong>Garment Details:</strong> {order.garmentDetails}</p>
                      <p><strong>Team:</strong> {order.team}</p>
                      <p><strong>Notes:</strong> {order.notes}</p>
                      <h5>Order Sizes</h5>
                      {order.orderSizes ? (
                        <ul>
                          {order.orderSizes.map((size, idx) => (
                            <li key={idx}>
                              <b>{size.category}</b> - <i>{size.color}</i>: XS({size.xs}), S({size.s}),
                              M({size.m}), L({size.l}), XL({size.xl}), XXL({size.xxl}),
                              3XL({size.xxxl}), 4XL({size.xxxxl}), 5XL({size.xxxxxl})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No sizes added for this order yet.</p>
                      )}
                      <p><strong>Files Uploaded:</strong></p>
                        <ul>
                          {order.files && order.files.length > 0 ? (
                            order.files.map((file, idx) => (
                              <li key={idx} style={{ marginBottom: '15px' }}>
                                {/* Image files (Preview + Download) */}
                                {file.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                      src={file.fileUrl}
                                      alt={`file-${idx}`}
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                      }}
                                      onClick={() => handleImageClick(file.fileUrl)} // Open the image on click
                                    />
                                    <a href={file.fileUrl} download={file.fileUrl.split('/').pop()}>
                                      <i className="bi bi-download" style={{ marginLeft: '8px' }}></i>
                                    </a>
                                  </div>
                                ) : file.fileUrl.match(/\.(pdf)$/i) ? (
                                  // PDF files (Preview + Download)
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        cursor: 'pointer',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: '10px',
                                        backgroundColor: '#f8f9fa',
                                      }}
                                      onClick={() => window.open(`https://docs.google.com/viewer?url=${file.fileUrl}&embedded=true`, '_blank')} // Opens PDF in a new tab for full preview
                                    >
                                      <i className="bi bi-file-earmark-pdf" style={{ fontSize: '24px', color: '#d9534f' }}></i> {/* PDF icon */}
                                    </div>
                                    <a href={file.fileUrl} download={file.fileUrl.split('/').pop()} style={{ marginLeft: '10px', textDecoration: 'none', color: '#007bff' }}>
                                      <span>{file.fileUrl.split('/').pop()}</span>
                                      <i className="bi bi-download" style={{ marginLeft: '8px', fontSize: '16px' }}></i> {/* Download icon */}
                                    </a>
                                  </div>
                                ) : (
                                  // Other file types (Preview + Download)
                                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        marginRight: '10px',
                                        textDecoration: 'none',
                                        backgroundColor: '#f8f9fa',
                                      }}
                                    >
                                      <i className="bi bi-file-earmark" style={{ fontSize: '24px' }}></i> {/* Generic file icon */}
                                    </a>
                                    <a href={file.fileUrl} download={file.fileUrl.split('/').pop()} style={{ marginLeft: '10px', textDecoration: 'none', color: '#007bff' }}>
                                      <span>{file.fileUrl.split('/').pop()}</span>
                                      <i className="bi bi-download" style={{ marginLeft: '8px', fontSize: '16px' }}></i> {/* Download icon */}
                                    </a>
                                  </div>
                                )}
                              </li>
                            ))
                          ) : (
                            <li>No files uploaded.</li>
                          )}
                        </ul>

                    </div>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Modal for displaying enlarged image */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={selectedImage} alt="Enlarged" style={{ width: '100%', height: 'auto' }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Completed;
