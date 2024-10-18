import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { BsDownload } from 'react-icons/bs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Import for drag-and-drop

const Pullsheet = () => {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [orderId, setOrderId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://137.184.75.176:5000/pullsheetList?search=${search}`, {
          params: {
            fromDate: fromDate,
            toDate: toDate,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [fromDate, toDate, search]);

  const handleOrderClick = (orderNumber, order_Id) => {
    setOpenOrder(openOrder === orderNumber ? null : orderNumber);
    setOrderId(order_Id);
  };

  const handleDateChange = (e) => {
    if (e.target.name === 'fromDate') {
      setFromDate(e.target.value);
    } else {
      setToDate(e.target.value);
    }
  };

  // Function to reorder items after dragging
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Handle drag end
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return; // Drop outside the list
    }

    const reorderedOrders = reorder(orders, source.index, destination.index);
    setOrders(reorderedOrders); // Update the state with new order
  };

  const downloadPDF = () => {
    const tableData = orders.map((order) => [
      order.id,
      order.orderNumber,
      order.clientName,
      order.garmentPO,
      order.garmentDetails,
      order.jobType,
    ]);

    const tableColumns = ['ID', 'Order Number', 'Client Name', 'Garment PO', 'Garment Details', 'JobType'];

    const doc = new jsPDF('landscape');
    doc.text('Pullsheet Orders', 14, 22);
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
    });
    doc.save(`Pullsheet_orders_${moment().format('YYYY-MM-DD')}.pdf`);
  };

  return (
    <div className="container" style={{ marginLeft: 250, paddingTop: 20, marginBottom: 70 }}>
      <h2>Pullsheet</h2>

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
            <BsDownload style={{ marginRight: '5px' }} /> Download
          </Button>
        </div>
      </div>

      {/* Drag and drop context for the orders */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="orders">
          {(provided) => (
            <table className="table table-striped table-hover" ref={provided.innerRef} {...provided.droppableProps}>
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
                  <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                    {(provided) => (
                      <React.Fragment>
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
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
                                {/* Order details go here */}
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      {/* Image Modal */}
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

export default Pullsheet;
