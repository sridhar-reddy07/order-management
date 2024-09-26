import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AddOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderMethod, setOrderMethod] = useState('ONLINE'); // Default value
  const [jobType, setJobType] = useState('');
  const [clientName, setClientName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [trackingLabel, setTrackingLabel] = useState('');
  const [garmentDetails, setGarmentDetails] = useState('');
  const [garmentPo, setGarmentPo] = useState('');
  const [team, setTeam] = useState('');
  const [dueDate, setDueDate] = useState(''); // New state for Due Date
  const [orderQty, setOrderQty] = useState(''); // New state for Order Quantity
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState(null);

  const navigate = useNavigate(); // Initialize navigate
  
  const handleSubmit = async (e) => {
    e.preventDefault();


     // Manual validation for required fields
     if (!garmentPo || !dueDate) {
      setError('Garment PO is required.');
      return;
    }
    if ( !dueDate) {
      setError(' Due Date is required.');
      return;
    }

    const formData = new FormData();
    formData.append('orderNumber', orderNumber);
    formData.append('orderStatus', orderStatus);
    formData.append('orderMethod', orderMethod);
    formData.append('jobType', jobType);
    formData.append('clientName', clientName);
    formData.append('shippingAddress', shippingAddress);
    formData.append('trackingLabel', trackingLabel);
    formData.append('garmentDetails', garmentDetails);
    formData.append('garmentPo', garmentPo);
    formData.append('team', team);
    formData.append('dueDate', dueDate); // Append Due Date
    formData.append('orderQty', orderQty); // Append Order Quantity
    formData.append('notes', notes);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }

    try {
      const response = await fetch('http://137.184.75.176:5000/addOrder', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Order added successfully!');
        navigate('/orderList'); // Redirect to All Orders page
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while adding the order.');
    }
  };

  return (
    <div style={{ marginLeft: 250, paddingTop: 20,marginBottom:70 }}>
      <form className="order-form" onSubmit={handleSubmit}>
        {/* Order Number */}
        <div className="form-group">
          <label htmlFor="orderNumber">Order Number:</label>
          <input
            type="text"
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Order Status */}
        <div className="form-group">
          <label htmlFor="orderStatus">Order Status:</label>
          <select
            id="orderStatus"
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select Status</option>
            <option value="PENDING">PENDING</option>
            <option value="NEED PAYMENT">NEED PAYMENT</option>
            <option value="PENDING ARTWORK">PENDING ARTWORK</option>
            <option value="APPROVED">APPROVED</option>
            <option value="HARDDATE">HARDDATE</option>
            <option value="PENDING APPROVAL">PENDING APPROVAL</option>
            <option value="READY">READY</option>
          </select>
        </div>

        {/* Order Method */}
        <div className="form-group">
          <label htmlFor="orderMethod">Order Method:</label>
          <select
            id="orderMethod"
            value={orderMethod}
            onChange={(e) => setOrderMethod(e.target.value)}
            required
            className="form-input"
          >
            <option value="ONLINE">ONLINE</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
        </div>

        {/* Job Type */}
        <div className="form-group">
          <label htmlFor="jobType">Job Type:</label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select Type</option>
            <option value="EMBROIDERY">Embroidery</option>
            <option value="SCREEN PRINTING">Screen Printing</option>
            <option value="DTG">DTG</option>
            <option value="DTG+EMB">DTG+EMB</option>
          </select>
        </div>

        {/* Client Name */}
        <div className="form-group">
          <label htmlFor="clientName">Client Name:</label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Shipping Address */}
        <div className="form-group">
          <label htmlFor="shippingAddress">Shipping Address:</label>
          <input
            type="text"
            id="shippingAddress"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Tracking Number */}
        <div className="form-group">
          <label htmlFor="TrackingLabel">Tracking Number:</label>
          <input
            type="text"
            id="TrackingLabel"
            value={trackingLabel}
            onChange={(e) => setTrackingLabel(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Garment Details */}
        <div className="form-group">
          <label htmlFor="garmentDetails">Garment Details:</label>
          <textarea
            id="garmentDetails"
            value={garmentDetails}
            onChange={(e) => setGarmentDetails(e.target.value)}
            className="form-textarea"
          />
        </div>

        {/* Garment PO */}
        <div className="form-group">
          <label htmlFor="garmentPo">Garment PO:</label>
          <input
            type="text"
            id="garmentPo"
            value={garmentPo}
            onChange={(e) => setGarmentPo(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Team */}
        <div className="form-group">
          <label htmlFor="team">Team:</label>
          <select
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            
            className="form-input"
          >
            required
            <option value="">Select Team</option>
            <option value="KARACHI TEAM">KARACHI TEAM</option>
            <option value="RIZ">RIZ</option>
            <option value="MUSSA">MUSSA</option>
            <option value="WAREHOUSE JOBS">WAREHOUSE JOBS</option>
          </select>
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label htmlFor="dueDate">Due Date:</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Order Quantity */}
        <div className="form-group">
          <label htmlFor="orderQty">Order Quantity:</label>
          <input
            type="number"
            id="orderQty"
            value={orderQty}
            onChange={(e) => setOrderQty(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-textarea"
          />
        </div>

        {/* Add Files */}
        <div className="form-group">
          <label htmlFor="files">Add Files:</label>
          <input
            type="file"
            id="files"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="form-file"
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default AddOrder;
