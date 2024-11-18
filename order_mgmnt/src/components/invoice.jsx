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
    if (!orderId || !field || updatedOrder === undefined || updatedOrder === null) {
      alert('Please provide all necessary details before updating the order.');
      return;
    }
  
    try {
      // Make the API call to update the selected order's specific field
      const response = await axios.put(`http://137.184.75.176:5000/updateOrder/${orderId}`, { [field]: updatedOrder });
  
      if (response.status === 200) {
        alert(response.data.message || 'Order updated successfully');
  
        // Update the local state with the new order data
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.id === orderId) {
              // Handle notes by appending the new note to the existing notes
              if (field === 'notes') {
                return { ...order, notes: `${order.notes ? order.notes + '\n' : ''}${updatedOrder}` };
              }
              // Handle other fields normally
              return { ...order, [field]: updatedOrder };
            }
            return order;
          })
        );

        setShowModal3(false);
      setOrderId('');
      setUpdatedOrder(''); 
  
        // Reset the modal state and clear inputs after successful update
        
      } else {
        alert('Failed to update the order. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('An error occurred while updating the order. Please try again.');
    }
  };


  // Function to show modal and set the order and field being edited
  const handleOrder = (id, field) => {
    setShowModal3(true);
    setOrderId(id);
    setField(field); // Track the field being updated
  };

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://137.184.75.176:5000/deleteorder/${id}`);
        if (response.status === 200) {
          setOrders(orders.filter(order => order.id !== id));
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
      
      order.garmentDetails ? 
      order.garmentDetails.split('\n').join(', ') : // Convert to a comma-separated string
      'No Garment details',
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
                <tr onClick={() => handleOrderClick(order.orderNumber,order.id)}>
                  <td className="order-cell">
                    
                    {order.orderNumber}
                  </td>
                  <td>{order.clientName}
                    <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.id,"clientName")}
                        ></i>) : ''}
                    </>
                  </td>
                  <td>{order.clientPhone}
                    <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.id,"clientPhone")}
                        ></i>) : ''}
                    </>
                  </td>
                  <td>{order.clientgmail}
                    <>
                    {isAdmin ? (<i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.id,"clientgmail")}
                        ></i>) : ''}
                    </>
                  </td>
                  <td>
                    {order.orderStatus}
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
                          onClick={() => handleOrder(order.id,"garmentPO")}
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
                                onClick={() => handleOrder(order.id,"trackingLabel")}
                              ></i>) : ''}
                        </>
                      </>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => handleOrder(order.id,"trackingLabel")}
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
                      onClick={() => deleteOrder(order.id)}
                    ></i>
                  </td>

                </tr>
                <tr>
                  <td colSpan="12">
                    <Collapse in={openOrder === order.orderNumber}>
                      <div>
                      <div>
                            <p><strong>Garment Details:</strong></p>
                            <div style={{ paddingLeft: '20px' }}>
                              {order.garmentDetails ? (
                                <ul>
                                  {order.garmentDetails.split('\n').map((detail, index) => (
                                    <li key={index}>{detail}</li> // Display each detail as a list item
                                  ))}
                                </ul>
                              ) : (
                                <p>No Garment details</p>
                              )}
                            </div>

                            {isAdmin && (
                              <i
                                className="bi bi-pencil"
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                                onClick={() => handleOrder(order.id, "garmentDetails")}
                              ></i>
                            )}
                          </div>
                          <p><strong>Notes:</strong> 
                          <div style={{ paddingLeft: '20px' }}>
                              {order.notes ? (
                                <ul>
                                  {order.notes.split('\n').map((detail, index) => (
                                    <li key={index}>{detail}</li> // Display each detail as a list item
                                  ))}
                                </ul>
                              ) : (
                                <p>No notes</p>
                              )}
                          </div>
                        <i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.id,"notes")}
                        ></i>
                        </p>
                        <p><strong>Team:</strong> {order.team}</p>
                        
                        
                        <p><strong>Shipping Address:</strong> {order.shippingAddress}
                        <>
                          {isAdmin ? (<i 
                                className="bi bi-pencil" 
                                style={{ cursor: 'pointer', marginLeft: '5px' }} 
                                onClick={() => handleOrder(order.id,"shippingAddress")}
                              ></i>) : ''}
                        </>
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
            {/* Render textarea for notes or garmentDetails, otherwise render input */}
            {field === 'notes' || field === 'garmentDetails' ? (
              <Form.Control
                as="textarea"
                rows={4} // Adjust the number of rows as needed
                value={updatedOrder}
                onChange={(e) => setUpdatedOrder(e.target.value)}
              />
            ) : (
              <Form.Control
                type="text"
                value={updatedOrder}
                onChange={(e) => setUpdatedOrder(e.target.value)}
              />
            )}
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
