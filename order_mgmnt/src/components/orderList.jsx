import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const OrderList = () => {
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
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://137.184.75.176:5000/ordersList');
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
    axios.get(`http://137.184.75.176:5000/ordersList?search=${search}`)
      .then((response) => {
        console.log(response)
        setOrders(response.data);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
      });
  }, [search]);

  const handleOrderClick = (orderNumber) => {
    setOpenOrder(openOrder === orderNumber ? null : orderNumber);
  };

  const getSelectClass = (status) => {
    switch (status) {
      case 'READY':
        return 'select-ready';
      case 'NEED PAYMENT':
        return 'select-need-payment';
      case 'PENDING':
        return 'select-pending';
      case 'PENDING ARTWORK':
        return 'select-pending-artwork';
      case 'APPROVED':
        return 'select-approved';
      case 'HARDDATE':
        return 'select-harddate';
      case 'PENDING APPROVAL':
        return 'select-pending-approval';
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
        ).filter((order) => order.orderStatus !== 'READY')
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddTrackingLabel = (orderNumber) => {
    setSelectedOrder(orderNumber); // Store the selected order number
    setShowModal(true); // Show the modal for entering tracking label
  };

  const handleSubmitTrackingLabel = async () => {
    try {
      const response = await fetch(`http://137.184.75.176:5000/updateTrackingLabel/${selectedOrder}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingLabel }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tracking label');
      }

      const updatedOrder = await response.json();
      console.log('Tracking label updated successfully:', updatedOrder);

      // Update the tracking label in the order list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderNumber === selectedOrder ? { ...order, trackingLabel } : order
        )
      );

      setShowModal(false); // Hide the modal after submission
      setTrackingLabel(''); // Clear the input field
    } catch (error) {
      console.error('Error updating tracking label:', error);
    }
  };
  const handleaddnotes = (orderNumber) => {
    setSelectedOrder(orderNumber); // Ensure the correct order is selected
    setShowModal2(true); // Show the modal to edit notes
  }

const handleupdatenotes = async () => {
  try {
    const response = await fetch(`http://137.184.75.176:5000/updateordernotes/${selectedOrder}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ordernotes }), // Send ordernotes instead of trackingLabel
    });

    if (!response.ok) {
      throw new Error('Failed to update order notes');
    }

    const updatedOrder = await response.json();
    alert('Order notes updated successfully 😘');

    // Update the order notes in the order list
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderNumber === selectedOrder ? { ...order, notes: ordernotes } : order
      )
    );

    setShowModal2(false); // Hide the modal after submission
    setOrdernotes(''); // Clear the input field
  } catch (error) {
    console.error('Error updating notes:', error);
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

  

  const toggleSortByDueDate = () => {
    setSortByDueDate(!sortByDueDate);
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortByDueDate ? dateA - dateB : dateB - dateA;
    });
    setOrders(sortedOrders);
  };

  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20,marginBottom:70 }}>
      <h2>All Orders</h2>
      <input
        type="text"
        className="form-control"
        style={{ width: '300px' }} 
        placeholder="Search orders... 🔍"
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Order Number</th>
            <th scope="col">Order Status</th>
            <th scope="col">Order Method</th>
            <th scope="col">Job Type</th>
            <th scope="col">
              Due Date
              <i
                className={`bi bi-sort-${sortByDueDate ? 'down' : 'up'}`}
                style={{ cursor: 'pointer', marginLeft: '5px' }}
                onClick={toggleSortByDueDate}
              ></i>
            </th>
            <th scope="col">Order Quantity</th>
            <th scope="col">Client Name</th>
            <th scope="col">Tracking Number</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            console.log('Current Order Status:', order.orderStatus); // Debug log
            return (
              <React.Fragment key={index}>
                <tr>
                  <td className="order-cell">
                    <i className="bi bi-eye" onClick={() => handleOrderClick(order.orderNumber)}></i>
                    {order.orderNumber}
                  </td>
                  <td>
                    <select
                      className={getSelectClass(order.orderStatus)}
                      value={order.orderStatus || ""}
                      onChange={(e) => updateOrderStatusInDatabase(e, order.orderNumber)}
                    >
                      <option value="READY">Ready</option>
                      <option value="NEED PAYMENT">Need Payment</option>
                      <option value="PENDING">Pending</option>
                      <option value="PENDING ARTWORK">Pending Art Work</option>
                      <option value="APPROVED">Approved</option>
                      <option value="HARDDATE">HardDate</option>
                      <option value="PENDING APPROVAL">Pending Approval</option>
                    </select>
                  </td>

                  <td>{order.orderMethod}</td>
                  <td>{order.jobType}</td>
                  
                  <td>{new Date(order.dueDate).toLocaleDateString('en-US')}</td>
                  <td>{order.orderQty}</td>
                  <td>{order.clientName}
                  <i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleOrder(order.orderNumber,"clientName")}
                        ></i>
                  </td>
                  
                  <td>
                    {order.trackingLabel ? (
                      <>
                        {order.trackingLabel}
                        <i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleAddTrackingLabel(order.orderNumber)}
                        ></i>
                      </>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => handleAddTrackingLabel(order.orderNumber)}
                      > 
                        Add num
                      </button>
                    )}
                  </td>

                </tr>
                <tr>
                  <td colSpan="6">
                    <Collapse in={openOrder === order.orderNumber}>
                      <div>
                        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                        <p><strong>Garment Details:</strong> {order.garmentDetails}</p>
                        <p><strong>Garment PO:</strong> {order.garmentPo}</p>
                        <p><strong>Team:</strong> {order.team}</p>
                        <p><strong>Notes:</strong> {order.notes}
                        <i 
                          className="bi bi-pencil" 
                          style={{ cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleaddnotes(order.orderNumber)}
                        ></i>
                        </p>
                        
                        <p><strong>Files Uploaded:</strong></p>
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

      {/* Modal for updating notes */}
      {/* Modal for updating notes */}
      <Modal show={showModal2} onHide={() => setShowModal2(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter notes</Form.Label>
            <Form.Control
              as="textarea"  // Change to textarea
              rows={3}       // Specify number of rows
              value={ordernotes}
              onChange={(e) => setOrdernotes(e.target.value)}  // Ensure state is updated on change
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal2(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleupdatenotes}>
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

    </div>
  );
};

export default OrderList;
