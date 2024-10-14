import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

import * as XLSX from 'xlsx'; // Import xlsx for Excel file generation
import { BsDownload } from 'react-icons/bs';
import moment from 'moment';
import jsPDF from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import autoTable plugin

const Invoice = () => {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the order for which "Add num" was clicked
  const [trackingLabel, setTrackingLabel] = useState(''); // To store the tracking label input
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState('');
  const [ordernotes, setOrdernotes] = useState("");
  const [search, setSearch] = useState('')
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [sortByDueDate, setSortByDueDate] = useState(false); // Add sorting toggle
  const [updatedOrder, setUpdatedOrder] =useState(null);
  const [field, setField] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false); // State for Size Modal
  const [orderSizes, setOrderSizes] = useState({});
  const [orderId, setOrderId] = useState(null);
 
  const [address, setAddress] = useState('')

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Check if user is an admin
    if (user && (user.email.toLowerCase() === "riz@tssprinting.com" )) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  
  // Fetch orders
  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://137.184.75.176:5000/invoiceList');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Fetch orders initially
  useEffect(() => {
    fetchOrders();
  }, []);
  // Handle adding invoice
  const handleAddInvoice = (orderNumber,shippingAddress) => {
    setInvoiceOrder(orderNumber);
    setShowInvoiceModal(true);
    setAddress(shippingAddress)
  };

  // Submit invoice details to backend
  const handleInvoiceSubmit = async () => {
    try {
      await axios.post('http://137.184.75.176:5000/addInvoice', {
        orderNumber: invoiceOrder,
        invoice: invoiceAmount,
        shippingAddress:address
        
      });
      setShowInvoiceModal(false);
      setInvoiceAmount('');
      alert('Invoice added successfully');

      fetchOrders();
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };
  
  const generatePDF = (order) => {
    const doc = new jsPDF();
    
    // Adding the title
    doc.setFontSize(20);
    doc.text('Invoice', 10, 10);

    // Adding order details
    const orderDetails = [
      { title: 'Order Number:', value: order.orderNumber },
      { title: 'Client Name:', value: order.clientName },
      { title: 'Client Phone:', value: order.clientPhone },
      { title: 'Client Email:', value: order.clientgmail },
      { title: 'Order Status:', value: order.orderStatus },
      { title: 'Order Method:', value: order.orderMethod },
      { title: 'Job Type:', value: order.jobType },
      { title: 'Due Date:', value: moment(order.dueDate).format('YYYY-MM-DD') },
      { title: 'Garment PO:', value: order.garmentPO },
      { title: 'Tracking Number:', value: order.trackingLabel },
      { title: 'Shipping Address:', value: order.shippingAddress },
      { title: 'Garment Details:', value: order.garmentDetails },
      { title: 'Team:', value: order.team },
      { title: 'Notes:', value: order.notes },
      { title: 'Invoice Amount:', value: order.invoice || 'N/A' }
    ];

    // Displaying each key-value pair
    orderDetails.forEach((detail, index) => {
      doc.setFontSize(12);
      doc.text(`${detail.title} ${detail.value}`, 10, 20 + (index * 10));
    });

    // Saving the PDF file
    doc.save(`invoice_${order.orderNumber}.pdf`);
  };


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Check if user is an admin
    if (user && user.email === "admin@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);


  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  

  
  useEffect(() => {
    // Fetch orders with the search query
    axios.get(`http://137.184.75.176:5000/invoiceList?search=${search}`)
      .then((response) => {
        console.log(response)
        setOrders(response.data);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
      });
  }, [search]);


  useEffect(() => {
    const fetchOrderSizes = async () => {
      console.log(orderId)
      if (orderId) {
        try {
          const response = await axios.get(`http://137.184.75.176:5000/fetchorders/${orderId}/sizes`);
          setOrderSizes((prevSizes) => ({
            ...prevSizes,
            [orderId]: response.data, // Store sizes for this order
          }));
          console.log(orderSizes)
        } catch (error) {
          console.error('Error fetching sizes:', error);
        }
      }
    };

    if (openOrder) {
      fetchOrderSizes(); // Fetch sizes only when an order is opened
    }
  }, [openOrder]);

  const handleOrderClick = (orderNumber,order_Id) => {
    setOpenOrder(openOrder === orderNumber ? null : orderNumber);
    setOrderId(order_Id)

  };

  console.log(orderSizes);

  const getSelectClass = (status) => {
    switch (status) {
      case 'DONE':
        return 'select-done';
      case 'COMPLETED':
        return 'select-completed';
      
      default:
        return '';
    }
  };
  const updateOrderStatusInDatabase = async (e, orderNumber) => {
    const status = e.target.value;
    try {
      const response = await fetch(`http://137.184.75.176:5000/updateOrderStatus/${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      console.log('Order status updated successfully:', updatedOrder);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderNumber === orderNumber ? { ...order, orderStatus: status } : order
        ).filter((order) => order.orderStatus !== 'DONE')
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  
  const handleUpdateOrder = async () => {
    try {
      // API call to update the selected order's specific field
      const response = await axios.put(`http://137.184.75.176:5000/updateOrder/${selectedOrder}`, { [field]: updatedOrder });
      
      alert('Order updated successfully');
      
      // Update the local state with the new order data
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderNumber === selectedOrder ? { ...order, [field]: updatedOrder } : order
        )
      );

      // Reset the modal state after update
      setShowModal3(false);
      setSelectedOrder('');
      setUpdatedOrder(''); // Clear updated order value
      
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Function to show modal and set the order and field being edited
  const handleOrder = (orderNumber, field) => {
    setShowModal3(true);
    setSelectedOrder(orderNumber);
    setField(field); // Track the field being updated
  };

  const deleteOrder = async (orderNumber) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://137.184.75.176:5000/deleteorder/${orderNumber}`);
        if (response.status === 200) {
          setOrders(orders.filter(order => order.orderNumber !== orderNumber));
          alert('Order deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete the order.');
      }
    }
  };

  const toggleSortByDueDate = () => {
    setSortByDueDate(!sortByDueDate);
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortByDueDate ? dateA - dateB : dateB - dateA;
    });
    setOrders(sortedOrders);
  };

  const downloadPDF = () => {
    // Prepare data in the format for the table
    const tableData = orders.map((order) => [
      order.id, // Adding the order ID
      order.orderNumber,
      order.clientName,
      
      order.garmentPO,
      
      order.garmentDetails,
      order.jobType
      
    ]);
  
    // Define table columns (headers)
    const tableColumns = [
      'ID', 'Order Number', 'Client Name',  'Garment PO', 'Garment Details','JobType'
    ];
  
    // Initialize jsPDF instance
    const doc = new jsPDF('landscape'); // Use 'landscape' for wide tables
  
    // Set title for the document
    doc.text('Completed Bob Orders', 14, 22);
  
    // Add table with autoTable plugin
    doc.autoTable({
      head: [tableColumns], // Table headers
      body: tableData,      // Table rows (order data)
      startY: 30,           // Position of the table
      theme: 'grid',        // You can also use 'striped', 'plain', etc.
      styles: {
        fontSize: 8,        // Adjust font size to fit more content
      },
      headStyles: {
        fillColor: [22, 160, 133], // Customize header background color
        textColor: 255,           // White text in headers
      }
    });
  
    // Save the PDF with a dynamic filename
    doc.save(`Completed Bob_orders_${moment().format('YYYY-MM-DD')}.pdf`);
  };

  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20,marginBottom:70 }}>
      <h2>payment Pending Bob Jobs</h2>
      <div className="row">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            style={{ width: '300px' }} 
            placeholder="Search orders... 🔍"
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
            <th scope="col" className="wide-col">Client Name</th>
            <th scope="col" className="wide-col">Client Phone</th>
            <th scope="col" className="extra-wide-col">Client Gmail</th>
            <th scope="col" className="wide-col">Order Status</th>
            <th scope="col" className="wide-col">Order Method</th>
            <th scope="col" className="wide-col">Job Type</th>
            <th scope="col" className="wide-col">
              Due Date
              <i
                className={`bi bi-sort-${sortByDueDate ? 'down' : 'up'} sort-icon`}
                onClick={toggleSortByDueDate}
              ></i>
            </th>
            
            <th scope="col" className="wide-col">Garment PO</th>
            <th scope="col" className="extra-wide-col">Tracking Number</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            console.log('Current Order Status:', order.orderStatus); // Debug log
            return (
              <React.Fragment key={index}>
                <tr>
                  <td className="order-cell">
                    <i className="bi bi-eye" onClick={() => handleOrderClick(order.orderNumber,order.id)}></i>
                    {order.orderNumber}
                  </td>
                  <td>{order.clientName}
                    <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.orderNumber,"clientName")}
                        ></i>) : ''}
                    </>
                  </td>
                  <td>{order.clientPhone}
                    <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.orderNumber,"clientPhone")}
                        ></i>) : ''}
                    </>
                  </td>
                  <td>{order.clientgmail}
                    <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.orderNumber,"clientgmail")}
                        ></i>) : ''}
                    </>
                  </td>
                  <td>
                    <>
                    {
                        isAdmin ?
                        <select
                      className={getSelectClass(order.orderStatus)}
                      value={order.orderStatus || ""}
                      onChange={(e) => updateOrderStatusInDatabase(e, order.orderNumber)}
                    >
                      <option value="DONE">Done</option>
                      <option value="COMPLETED">Completed</option>
                      
                    </select> : ''
                    }
                    </>
                    
                  </td>


                  <td>{order.orderMethod}</td>
                  <td>{order.jobType}</td>
                  
                  <td>{new Date(order.dueDate).toLocaleDateString('en-US')}
                  
                  </td>
                  
                  

                  <td>{order.garmentPO}
                  <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.orderNumber,"garmentPO")}
                        ></i>) : ''}
                  </>
                  </td>
                  
                  
                  <td>
                    {order.trackingLabel ? (
                      <>
                        {order.trackingLabel}
                        <>
                          {isAdmin ? (<i 
                                className="bi bi-pencil" 
                                style={{ cursor: 'pointer', marginLeft: '5px' }} 
                                onClick={() => handleOrder(order.orderNumber,"trackingLabel")}
                              ></i>) : ''}
                        </>
                      </>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => handleOrder(order.orderNumber,"trackingLabel")}
                      > 
                        Add num
                      </button>
                    )}
                  </td>

                  <td>
                    <>
                        {order.invoice ? (
                        <>
                            ${order.invoice} {/* Display the invoice amount */}
                            {isAdmin ? (
                            <i
                                className="bi bi-pencil"
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                                onClick={() => handleAddInvoice(order.orderNumber, order.shippingAddress)} // Admin can edit the invoice
                            ></i>
                            ) : null}
                        </>
                        ) : (
                        <Button
                            variant="primary"
                            onClick={() => handleAddInvoice(order.orderNumber, order.shippingAddress)} // Display Add Invoice button if no invoice
                        >
                            Add Invoice
                        </Button>
                        )}
                    </>
                    </td>

                  <td>
                  <Button onClick={() => generatePDF(order)} className="ml-2">Download Invoice PDF</Button>
                  </td>

                  <td>
                    <i
                      className="bi bi-trash"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => deleteOrder(order.orderNumber)}
                    ></i>
                  </td>

                </tr>
                <tr>
                  <td colSpan="6">
                    <Collapse in={openOrder === order.orderNumber}>
                      <div>
                        <p><strong>Shipping Address:</strong> {order.shippingAddress}
                        <>
                          {isAdmin ? (<i 
                                className="bi bi-pencil" 
                                style={{ cursor: 'pointer', marginLeft: '5px' }} 
                                onClick={() => handleOrder(order.orderNumber,"shippingAddress")}
                              ></i>) : ''}
                        </>
                        </p>
                        <p><strong>Garment Details:</strong> {order.garmentDetails}
                        <>
                          {isAdmin ? (<i 
                                className="bi bi-pencil" 
                                style={{ cursor: 'pointer', marginLeft: '5px' }} 
                                onClick={() => handleOrder(order.orderNumber,"garmentDetails")}
                              ></i>) : ''}
                        </></p>
                        
                        <p><strong>Team:</strong> {order.team}</p>
                        <p><strong>Notes:</strong> {order.notes}
                        <i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.orderNumber,"notes")}
                        ></i>
                        </p>
                        

                        <h5>Order Sizes</h5>
                        {orderSizes[order.id] ? (
                          <ul>
                            {orderSizes[order.id].map((size, idx) => (
                              <li key={idx}>

                                <b>{size.category} - </b>,<i> {size.color} </i> : XS({size.xs}), S({size.s}), M({size.m}),
                                L({size.l}), XL({size.xl}), XXL({size.xxl}), 3XL({size.xxxl}),
                                4XL({size.xxxxl}), 5XL({size.xxxxxl})
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
            );
          })}
        </tbody>
      </table>

      <Modal show={showModal3} onHide={() => setShowModal3(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter {field}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{field}</Form.Label>
            <Form.Control
              type="text"
              value={updatedOrder}
              onChange={(e) => setUpdatedOrder(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal3(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleUpdateOrder()}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      
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

      



        <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Invoice for Order #{invoiceOrder}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(parseInt(e.target.value)) }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInvoiceSubmit}>
            Submit Invoice
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
};

export default Invoice;
