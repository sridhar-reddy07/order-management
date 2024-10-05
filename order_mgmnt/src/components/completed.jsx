import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment'; // To handle date formatting

const Completed = () => {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD')); // Default to today
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));     // Default to today
  const [orderId, setOrderId] = useState(null); // Initialize orderId state
  const [showImageModal, setShowImageModal] = useState(false); // For controlling image modal
  const [selectedImage, setSelectedImage] = useState('');      // For selected image
  

  // Fetch orders with date range (default: today's date)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://137.184.75.176:5000/completedList`, {
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
  }, [fromDate, toDate]); // Trigger fetching when dates change

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
        <div className="col-md-6">
          <label>Search Orders:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search orders... 🔍"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
