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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false); // State for Size Modal
  const [selectedOrderForSize, setSelectedOrderForSize] = useState(null); // Track selected order for size
  const [address, setAddress] = useState('')

  const [sizeData, setSizeData] = useState({
    category: 'Adult', // Default category
    desc: '',
    color: '',
    xs: 0,
    s: 0,
    m: 0,
    l: 0,
    xl: 0,
    xxl: 0,
  });
  const handleSizeModalShow = (orderNumber,shippingAddress) => {
    setSelectedOrderForSize(orderNumber); // Set the selected order number
    setAddress(shippingAddress)
    setShowSizeModal(true);
  };
  const handleSizeFormSubmit = async () => {
    try {
      // Replace these with actual values from the order
      
      
  
      // Step 1: Fetch order_id using orderNumber and shippingAddress
      const orderId = await fetchOrderId(selectedOrder,address);
  
      if (!orderId) {
        alert('Order not found');
        return;
      }
  
      // Step 2: Once the order_id is found, submit the size data
      const response = await axios.post(`http://localhost:5000/orders/${orderId}/sizes`, sizeData);
      console.log('Size data added:', response.data);
  
      // Close the modal after submission
      setShowSizeModal(false);
    } catch (error) {
      console.error('Error adding size data:', error);
    }
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
                    <i className="bi bi-eye" onClick={() => handleOrderClick(order.orderNumber)}></i>
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
                    <Button
                      variant="primary"
                      onClick={() => handleSizeModalShow(order.orderNumber,order.shippingAddress)}
                    >
                      Add Size
                    </Button>
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

      {/* Size Entry Modal */}
      <Modal show={showSizeModal} onHide={handleSizeModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Sizes for Order #{selectedOrderForSize}</Modal.Title>
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
                name="desc"
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
              <div className="row">
                <div className="col">
                  <Form.Label>XS</Form.Label>
                  <Form.Control
                    type="number"
                    name="xs"
                    value={sizeData.xs}
                    onChange={handleSizeInputChange}
                    placeholder="XS"
                  />
                </div>
                <div className="col">
                  <Form.Label>S</Form.Label>
                  <Form.Control
                    type="number"
                    name="s"
                    value={sizeData.s}
                    onChange={handleSizeInputChange}
                    placeholder="S"
                  />
                </div>
                <div className="col">
                  <Form.Label>M</Form.Label>
                  <Form.Control
                    type="number"
                    name="m"
                    value={sizeData.m}
                    onChange={handleSizeInputChange}
                    placeholder="M"
                  />
                </div>
                <div className="col">
                  <Form.Label>L</Form.Label>
                  <Form.Control
                    type="number"
                    name="l"
                    value={sizeData.l}
                    onChange={handleSizeInputChange}
                    placeholder="L"
                  />
                </div>
                <div className="col">
                  <Form.Label>XL</Form.Label>
                  <Form.Control
                    type="number"
                    name="xl"
                    value={sizeData.xl}
                    onChange={handleSizeInputChange}
                    placeholder="XL"
                  />
                </div>
                <div className="col">
                  <Form.Label>2XL</Form.Label>
                  <Form.Control
                    type="number"
                    name="xxl"
                    value={sizeData.xxl}
                    onChange={handleSizeInputChange}
                    placeholder="XXL"
                  />
                </div>
                <div className="col">
                  <Form.Label>3XL</Form.Label>
                  <Form.Control
                    type="number"
                    name="xxxl"
                    value={sizeData.xxxl}
                    onChange={handleSizeInputChange}
                    placeholder="XXXL"
                  />
                </div>
                <div className="col">
                  <Form.Label>4XL</Form.Label>
                  <Form.Control
                    type="number"
                    name="xxxxl"
                    value={sizeData.xxxl}
                    onChange={handleSizeInputChange}
                    placeholder="XXXXL"
                  />
                </div>
                <div className="col">
                  <Form.Label>5XL</Form.Label>
                  <Form.Control
                    type="number"
                    name="xxxxxl"
                    value={sizeData.xxxxxl}
                    onChange={handleSizeInputChange}
                    placeholder="XXXXXL"
                  />
                </div>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSizeModalClose}>
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

export default OrderList;
