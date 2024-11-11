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
  
  
function cleanFileName(url) {
  // Decode URI components to handle encoded characters like %20 for space
  let decodedUrl = decodeURIComponent(url);
  
  // Extract the filename from the URL if necessary
  let fileName = decodedUrl.split('/').pop(); // Gets the last part after the last slash
  
  // Optional: Remove any unwanted parts from the filename, such as timestamps or identifiers
  // For example, if filenames contain a pattern like '1730410751349-', you might want to remove it:
  fileName = fileName.replace(/^\d+-/, ''); // Removes leading digits followed by a dash
  
  // More cleaning can be applied here depending on the specific filename patterns you have
  
  return fileName;
}
  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20, marginBottom: 70 }}>
      <h2>Completed Jobs</h2>

      {/* Date Filter Inputs */}
      <div className="row">
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
        <Button variant="primary" onClick={downloadPDF}>
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
              <tr >
                <td className="order-cell" onClick={() => handleOrderClick(order.orderNumber,order.id)}>
                  
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
                <td>
                
                      
                        {order.trackingLabel}
                        
                        {/* Copy icon */}
                        <i
                          className="bi bi-clipboard"
                          style={{ cursor: 'pointer', marginLeft: '10px' }}
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingLabel);
                            alert('Copied to clipboard!'); // Optional feedback for the user
                          }}
                        ></i>
                      
                    
                  </td>
              </tr>
              <tr>
                <td colSpan="12">
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
                      <ul style={{ display: 'flex', flexWrap: 'wrap', listStyleType: 'none', padding: 0 }}>
                              {order.files && order.files.length > 0 ? (
                                order.files.filter((file) => file.fileUrl)
                                .map((file, idx) => {
                                  const fileUrl = String(file.fileUrl); // Convert fileUrl to a string
                                  const fileName = cleanFileName(fileUrl); // Clean the filename for display

                                  return (
                                    <li key={idx} style={{
                                      margin: '5px',
                                      width: 'calc(100% / 7 - 10px)', 
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      {/* Display different content based on file type */}
                                      {fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                        <>
                                          <img
                                            src={fileUrl}
                                            alt={`file-${idx}`}
                                            style={{ width: '100%', height: 'auto', maxWidth: '100px', marginBottom: '5px' }}
                                            onClick={() => handleImageClick(fileUrl)}
                                          />
                                          <div>
                                            <a href={fileUrl} download={fileName}>
                                              {fileName} {/* Display the cleaned filename */}
                                            </a>
                                            
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div style={{
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              justifyContent: 'center', 
                                              width: '100px', 
                                              height: '100px', 
                                              border: '1px solid #ddd', 
                                              borderRadius: '5px', 
                                              backgroundColor: '#f8f9fa'
                                            }}
                                          >
                                            <i className="bi bi-file-earmark-text" style={{ fontSize: '24px' }}></i>
                                          </div>
                                          <div>
                                            <a href={fileUrl} download={fileName}>
                                              {fileName} {/* Display the cleaned filename */}
                                            </a>
                                            
                                          </div>
                                        </>
                                      )}
                                    </li>
                                  );
                                })
                              ) : (
                                <li style={{ width: '100%', textAlign: 'center' }}>No files uploaded.</li>
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
