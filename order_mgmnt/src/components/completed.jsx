import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const Completed = () => {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the order for which "Add num" was clicked
  const [trackingLabel, setTrackingLabel] = useState(''); // To store the tracking label input
  const [search, setSearch] = useState('')
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/completedList');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched Orders:', data); // Debug log
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);
  useEffect(() => {
    // Fetch orders with the search query
    axios.get(`http://localhost:5000/completedList?search=${search}`)
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

  

  const handleAddTrackingLabel = (orderNumber) => {
    setSelectedOrder(orderNumber); // Store the selected order number
    setShowModal(true); // Show the modal for entering tracking label
  };

  const handleSubmitTrackingLabel = async () => {
    try {
      const response = await fetch(`http://localhost:5000/updateTrackingLabel/${selectedOrder}`, {
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

  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20 }}>
      <h2>Completed Orders</h2>
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
                  {order.orderStatus}
                  </td>
                  <td>{order.orderMethod}</td>
                  <td>{order.jobType}</td>
                  <td>{order.clientName}</td>
                  <td>
                    {order.trackingLabel ? (
                      <>{order.trackingLabel}</>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ cursor: 'pointer'}} 
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
                        <p><strong>Notes:</strong> {order.notes}</p>
                        <p><strong>Files Uploaded:</strong></p>
                          <ul>
                            {order.files && order.files.length > 0 ? (
                              order.files.map((file, idx) => (
                                <li key={idx}>
                                  
                                    {file.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                      <img
                                        src={file.fileUrl}
                                        alt={`file-${idx}`}
                                        style={{
                                          width: '100px',
                                          height: '100px',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => handleImageClick(file.fileUrl)} // Open the image on click
                                      />
                                    ) : (
                                      <a href={file.fileUrl} download={file.fileUrl.split('/').pop()}>
                                      <span>{file.fileUrl.split('/').pop()}</span> </a>
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

      {/* Modal for entering tracking label */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Tracking Label</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Tracking Label</Form.Label>
            <Form.Control
              type="text"
              value={trackingLabel}
              onChange={(e) => setTrackingLabel(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitTrackingLabel}>
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

export default Completed;
