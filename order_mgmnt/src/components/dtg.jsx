import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment'; // To handle date formatting
import * as XLSX from 'xlsx'; // Import xlsx for Excel file generation
import { BsDownload } from 'react-icons/bs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dtg = () => {
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

  const [sizeData, setSizeData] = useState({
    category: 'Adult', // Default category
    description: '',
    color: '',
    xs: 0,
    s: 0,
    m: 0,
    l: 0,
    xl: 0,
    xxl: 0,
    xxxl:0,
    xxxxl:0,
    xxxxxl:0,
  });

  const handleSizeInputChange = (event) => {
    const { name, value } = event.target;
    setSizeData((prevData) => ({
      ...prevData,
      [name]: name === 'xs' || name === 's' || name === 'm' || name === 'l' || name === 'xl' || name === 'xxl' || name === 'xxxl' || name === 'xxxxl' || name === 'xxxxxl'
        ? parseInt(value) || 0  // Convert to number or default to 0 if empty
        : value
    }));
    console.log(sizeData);
  };

  const handleSizeModalShow = (orderNumber,shippingAddress) => {
    setSelectedOrder(orderNumber); // Set the selected order number
    setAddress(shippingAddress)
    setShowSizeModal(true);
  };

  
  const handleSizeFormSubmit = async () => {
    try {
      // Fetch order ID using the selected order and address
      const response = await fetch(
        `http://137.184.75.176:5000/getOrderId?orderNumber=${selectedOrder}&shippingAddress=${address}`
      );
      
      if (!response.ok) {
        throw new Error('Order not found');
      }
  
      const data = await response.json();  // Correctly parse the response JSON
      console.log(data + "kjhgfyhj");  // Log the received order ID or response
  
      if (!data || !data.order_id) {  // Check if order_id exists in the response
        alert('Order not found');
        return;
      }
  
      // Ensure sizeData contains valid numbers for sizes
      const formattedSizeData = {
        ...sizeData,
        xs: parseInt(sizeData.xs) || 0,
        s: parseInt(sizeData.s) || 0,
        m: parseInt(sizeData.m) || 0,
        l: parseInt(sizeData.l) || 0,
        xl: parseInt(sizeData.xl) || 0,
        xxl: parseInt(sizeData.xxl) || 0,
        xxxl: parseInt(sizeData.xxxl) || 0,
        xxxxl: parseInt(sizeData.xxxxl) || 0,
        xxxxxl: parseInt(sizeData.xxxxxl) || 0,
      };
  
      // POST the size data to the server using the retrieved order_id
      const sizeResponse = await axios.post(
        `http://137.184.75.176:5000/orders/${data.order_id}/sizes`,
        formattedSizeData
      );
  
      console.log('Size data added:', sizeResponse.data);
      setShowSizeModal(false); // Close the modal after successful submission
    } catch (error) {
      console.error('Error adding size data:', error);
      alert(error.message); // Display error to the user
    }
  };
  
  

  

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Check if user is an admin
    if (user && (user.email.toLowerCase() === "riz@tssprinting.com" || user.email.toLowerCase() === "mussa@tssprinting.com" || user.email.toLowerCase() === "karachi@tssprinting.com")) {
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
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://137.184.75.176:5000/dtgList');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched Orders:', data); // Debug log
        setOrders(data);
        console.log(orders.files);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);
  useEffect(() => {
    // Fetch orders with the search query
    axios.get(`http://137.184.75.176:5000/dtgList?search=${search}`)
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
      case 'READY':
        return 'select-ready';
      case 'ONHOLD':
        return 'select-onhold';
      case 'INPROGRESS':
        return 'select-in-progress';
      case 'HARDDATE':
        return 'select-harddate';
      case 'DONE':
        return 'select-done';
      default:
        return '';
    }
  };

  const updateOrderStatusInDatabase = async (e, id) => {
    const status = e.target.value;
    try {
      const response = await fetch(`http://137.184.75.176:5000/updateOrderStatus/${id}`, {
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
          order.id === id ? { ...order, orderStatus: status } : order
        ).filter((order) => order.orderStatus !== 'DONE' &&  order.orderStatus !== 'PENDING' && order.orderStatus !== 'CANCEL')
      );
     
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  
  const handleUpdateOrder = async () => {
    try {
      // API call to update the selected order's specific field
      const response = await axios.put(`http://137.184.75.176:5000/updateOrder/${orderId}`, { [field]: updatedOrder });
      
      alert('Order updated successfully');
      
      // Update the local state with the new order data
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, [field]: updatedOrder } : order
        )
      );

      // Reset the modal state after update
      setShowModal3(false);
      setOrderId('');
      setUpdatedOrder(''); // Clear updated order value
      
    } catch (error) {
      console.error('Error updating order:', error);
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
    doc.text('DTG Orders', 14, 22);
  
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
    doc.save(`DTG_orders_${moment().format('YYYY-MM-DD')}.pdf`);
  };
  const handleFileUpload = async (id) => {
    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true; // Allow multiple files to be selected
        fileInput.onchange = async (event) => {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;

            const formData = new FormData();
            files.forEach((file) => formData.append('files', file)); // Append each file

            const response = await fetch(`http://137.184.75.176:5000/api/orders/${id}/files`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const uploadedFiles = await response.json(); // Assuming it returns an array of file URLs
                const fileUrls = uploadedFiles.fileUrls || [];

                if (fileUrls.length === 0) {
                    console.error('File URLs are undefined or empty from backend.');
                    return;
                }

                // Update state to include new file details
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === id
                            ? { 
                                ...order, 
                                files: [...(order.files || []), ...fileUrls.map((url) => ({ fileUrl: url }))] 
                              }
                            : order
                    )
                );
                console.log(orders);
            } else {
                console.error('Failed to upload files:', response.statusText);
            }
        };
        fileInput.click();
    } catch (error) {
        console.error('Error during file upload:', error);
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

const handleDeleteFile = async (file ,index, id) => {
  

  try {
    const response = await fetch(`http://137.184.75.176:5000/api/orders/${id}/files`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl: file.fileUrl }),
    });

    if (response.ok) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? { ...order, files: order.files.filter((f)=>f.fileUrl !== file.fileUrl) }
            : order
        )
      );
    } else {
      const errorText = await response.text();
      console.error('Failed to delete file:', errorText);
    }
  } catch (error) {
    console.error('Error during file deletion:', error);
  }
};
  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20,marginBottom:70 }}>
      <h2>DTG</h2>
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
                    <select
                      value={order.orderStatus}
                      className={getSelectClass(order.orderStatus)}
                      onChange={(e) => updateOrderStatusInDatabase(e, order.id)}
                    >
                      <option value="READY">READY</option>
                      <option value="ONHOLD">ONHOLD</option>
                      <option value="INPROGRESS">INPROGRESS</option>
                      <option value="HARDDATE">HARDDATE</option>
                      <option value="DONE">DONE</option>
                      {isAdmin ? (<option value="PENDING">PENDING</option>):''}
                      {isAdmin ? (<option value="CANCEL">CANCEL</option>) : ''}
                    </select>
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
                    <Button
                      variant="primary"
                      onClick={() => handleSizeModalShow(order.orderNumber,order.shippingAddress)}
                    >
                      Add Size
                    </Button>
                  </td>

                  {isAdmin ? (<td>
                    <i
                      className="bi bi-trash"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => deleteOrder(order.id)}
                    ></i>
                  </td>) :'' }

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
                        {isAdmin ? <a
                              
                              onClick={() => handleFileUpload(order.id)} // Define this function to handle file uploads
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: '#007bff',
                                marginBottom: '15px',
                                cursor: 'pointer',
                              }}
                            >
                              <i className="bi bi-plus-circle" style={{ marginRight: '5px', fontSize: '20px' }}></i> Add File
                            </a> : ''}
                            
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
                                            {isAdmin ?(
                                            <button
                                              onClick={() => handleDeleteFile(file, idx, order.id)}
                                              style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#d9534f',
                                                cursor: 'pointer'
                                              }}
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>) :''}
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
                                            {isAdmin ?(
                                            <button
                                              onClick={() => handleDeleteFile(file, idx, order.id)}
                                              style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#d9534f',
                                                cursor: 'pointer'
                                              }}
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>) :''}
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

      {/* Size Entry Modal */}
        <Modal show={showSizeModal} onHide={() => setShowSizeModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Sizes for Order #{selectedOrder}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Category Dropdown */}
              <Form.Group controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  name="category"
                  value={sizeData.category}
                  onChange={handleSizeInputChange}
                >
                  <option value="Adult">Adult</option>
                  <option value="Youth">Youth</option>
                  <option value="Ladies">Ladies</option>
                </Form.Control>
              </Form.Group>

              {/* Description */}
              <Form.Group controlId="formDesc">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={sizeData.description}
                  onChange={handleSizeInputChange}
                  placeholder="Enter description"
                />
              </Form.Group>

              {/* Color */}
              <Form.Group controlId="formColor">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="text"
                  name="color"
                  value={sizeData.color}
                  onChange={handleSizeInputChange}
                  placeholder="Enter color"
                />
              </Form.Group>

              {/* Size Inputs */}
              <Form.Group controlId="formSizes">
                <Form.Label>Sizes</Form.Label>

                {/* First Row: XS, S, M, L */}
                <div className="row mb-3">
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>XS</Form.Label>
                    <Form.Control
                      type="number"
                      name="xs"
                      value={sizeData.xs}
                      onChange={handleSizeInputChange}
                      placeholder="XS"
                      min="0"
                    />
                  </div>
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>S</Form.Label>
                    <Form.Control
                      type="number"
                      name="s"
                      value={sizeData.s}
                      onChange={handleSizeInputChange}
                      placeholder="S"
                      min="0"
                    />
                  </div>
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>M</Form.Label>
                    <Form.Control
                      type="number"
                      name="m"
                      value={sizeData.m}
                      onChange={handleSizeInputChange}
                      placeholder="M"
                      min="0"
                    />
                  </div>
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>L</Form.Label>
                    <Form.Control
                      type="number"
                      name="l"
                      value={sizeData.l}
                      onChange={handleSizeInputChange}
                      placeholder="L"
                      min="0"
                    />
                  </div>
                </div>

                {/* Second Row: XL, XXL, XXXL, XXXXL, XXXXXL */}
                <div className="row">
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>XL</Form.Label>
                    <Form.Control
                      type="number"
                      name="xl"
                      value={sizeData.xl}
                      onChange={handleSizeInputChange}
                      placeholder="XL"
                      min="0"
                    />
                  </div>
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>2XL</Form.Label>
                    <Form.Control
                      type="number"
                      name="xxl"
                      value={sizeData.xxl}
                      onChange={handleSizeInputChange}
                      placeholder="XXL"
                      min="0"
                    />
                  </div>
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                    <Form.Label>3XL</Form.Label>
                    <Form.Control
                      type="number"
                      name="xxxl"
                      value={sizeData.xxxl}
                      onChange={handleSizeInputChange}
                      placeholder="XXXL"
                      min="0"
                    />
                  </div>
                  
                </div>
                <div className='row'>
                  <div className="col-md-3 col-sm-4 col-6 mb-2">
                      <Form.Label>4XL</Form.Label>
                      <Form.Control
                        type="number"
                        name="xxxxl"
                        value={sizeData.xxxxl}
                        onChange={handleSizeInputChange}
                        placeholder="XXXXL"
                        min="0"
                      />
                    </div>
                    <div className="col-md-3 col-sm-4 col-6 mb-2">
                      <Form.Label>5XL</Form.Label>
                      <Form.Control
                        type="number"
                        name="xxxxxl"
                        value={sizeData.xxxxxl}
                        onChange={handleSizeInputChange}
                        placeholder="XXXXXL"
                        min="0"
                      />
                    </div>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSizeModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSizeFormSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>


    </div>
  );
};

export default Dtg;
