import React, { useState, useEffect } from 'react';
import { Collapse, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { BsDownload } from 'react-icons/bs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Dropdown } from 'react-bootstrap';

const Pullsheet = () => {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [orderId, setOrderId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [sortByPO,setSortByPO] =useState(false)
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

  useEffect(() => {
    console.log('Current Orders:', orders); // Log the orders list on each update
  }, [orders]); // This will trigger every time the orders state changes
  

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
  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };
 
  
  const onDragEnd = debounce((result) => {
    const { source, destination } = result;
    console.log(result)
    if (!destination) return;
  
    const reorderedOrders = reorder(orders, source.index, destination.index);
    setOrders(reorderedOrders);
  }, 300);

  const downloadEmbroideryPDF = () => {
    const embroideryOrders = orders.filter(order => order.jobType === 'EMBROIDERY');
    generatePDF(embroideryOrders, 'Pull Sheet Embroidery Orders');
  };
  
  const downloadDTGPDF = () => {
    const dtgOrders = orders.filter(order => order.jobType === 'DTG');
    generatePDF(dtgOrders, 'Pull Sheet DTG Orders');
  };
  
  const generatePDF = (data, title) => {
    const tableData = data ? data.map(order => [
      order.id,
      order.orderNumber,
      order.clientName,
      order.garmentPO,
      order.garmentDetails,
      order.jobType,
    ]) : [];
  
    const tableColumns = ['ID', 'Order Number', 'Client Name', 'Garment PO', 'Garment Details', 'JobType'];
  
    const doc = new jsPDF('landscape');
    doc.text(title, 14, 22);
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
    });
    doc.save(`${title ? title.replace(/ /g, '_') : 'PullSheetOrders'}_${moment().format('YYYY-MM-DD')}.pdf`);

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
  const toggleSortByPO = () => {
    setSortByPO(currentState => {
        const newState = !currentState;
        
        // Fetch sorted data from the backend
        axios.get(`http://137.184.75.176:5000/orders/sorted?sortByPO=${newState}`)
            .then(response => {
                setOrders(response.data);
            })
            .catch(error => {
                console.error('Error fetching sorted orders:', error);
            });

        return newState;
    });
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
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic" style={{ backgroundColor: 'transparent' }}>
              <BsDownload style={{ marginRight: '5px' }} /> Download
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={generatePDF}>Download All Orders</Dropdown.Item>
              <Dropdown.Item onClick={downloadEmbroideryPDF}>Download Embroidery</Dropdown.Item>
              <Dropdown.Item onClick={downloadDTGPDF}>Download DTG</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      {orders.length > 0 ? (
      <DragDropContext onDragEnd={onDragEnd}>
        
            <div>
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
                    <th scope="col">Garment PO
                    <i
                      className={`bi bi-sort-${sortByPO ? 'down' : 'up'} sort-icon`}
                      onClick={toggleSortByPO}
                    ></i>
                    </th>
                    <th scope="col">Tracking Number</th>
                  </tr>
                </thead>
                <Droppable droppableId="orders">
               {(provided) => (
                <tbody  ref={provided.innerRef} {...provided.droppableProps}>
                  {orders.map((order, index) => (
                    <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                      {(provided) => (
                        <React.Fragment>
                          <tr
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            onClick={() => handleOrderClick(order.orderNumber,order.id)}
                          >
                            {console.log (order.id, index) }
                            <td className="order-cell">
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
                      )}
                    </Draggable>
                  ))}
                  
                  {provided.placeholder}
                  
                  
                </tbody>
              )}
              </Droppable>
              </table>
            </div>
        
        
      </DragDropContext>
      ):
      <h1>No orders available.
      </h1>}

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
