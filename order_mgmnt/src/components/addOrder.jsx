import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderMethod, setOrderMethod] = useState('ONLINE'); // Default value
  const [jobType, setJobType] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState(''); // New Client Phone
  const [clientgmail, setClientGmail] = useState(''); // New Client Email
  const [shippingAddress, setShippingAddress] = useState('');
  const [trackingLabel, setTrackingLabel] = useState('');
  const [garmentDetails, setGarmentDetails] = useState('');
  const [garmentPo, setGarmentPo] = useState('');
  const [team, setTeam] = useState('');
  const [dueDate, setDueDate] = useState('');
  
 
  const [invoice, setInvoice] = useState(''); // New Invoice field
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);


  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Append new files to the existing files state
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const formData = new FormData();
    formData.append('orderNumber', orderNumber);
    formData.append('orderStatus', orderStatus);
    formData.append('orderMethod', orderMethod);
    formData.append('jobType', jobType);
    formData.append('clientName', clientName);
    formData.append('clientPhone', clientPhone);
    formData.append('clientgmail', clientgmail);
    formData.append('shippingAddress', shippingAddress);
    formData.append('trackingLabel', trackingLabel);
    formData.append('garmentDetails', garmentDetails);
    formData.append('garmentPo', garmentPo);
    formData.append('team', team);
    formData.append('dueDate', dueDate);
    
    formData.append('invoice', invoice);
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
        navigate('/orderList');
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
    <div style={{ marginLeft: 250, paddingTop: 20, marginBottom: 70 }}>
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
            <option value="WAREHOUSE JOBS">WAREHOUSE JOBS</option>
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
            <option value="SP+EMB">SP+EMB</option>
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

        {/* Client Phone */}
        <div className="form-group">
          <label htmlFor="clientPhone">Client Phone:</label>
          <input
            type="tel"
            id="clientPhone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Client Email */}
        <div className="form-group">
          <label htmlFor="clientgmail">Client Email:</label>
          <input
            type="email"
            id="clientgmail"
            value={clientgmail}
            onChange={(e) => setClientGmail(e.target.value)}
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
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label> Tracking Label</label>
          <input
            type="text"
            id="trackingLabel"
            value={trackingLabel}
            onChange={(e) => setTrackingLabel(e.target.value)}
            
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="garmentDetails">Garment Details:</label>
          <textarea
            id="garmentDetails"
            value={garmentDetails}
            onChange={(e) => setGarmentDetails(e.target.value)}
            className="form-input"
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
            required
            className="form-input"
          />
        </div>

        {/* Team */}
        <div className="form-group">
          <label htmlFor="team">Team:</label>
          <select
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select Team</option>
            <option value="KARACHI TEAM">KARACHI TEAM</option>
            <option value="RIZ">RIZ</option>
            <option value="MUSSA">MUSSA</option>
            <option value="BOB JOB">BOB JOB</option>
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

        
        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
        {/* Upload File */}
        <div className="form-group">
          <label htmlFor="files">Upload File:</label>
          <input
            type="file"
            id="files"
            onChange={handleFileChange}
            className="form-input"
            multiple // Allows multiple file selection
          />
        </div>

        {/* Display selected files */}
        <div className="file-list">
          {files.length > 0 && (
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
        {/* Submit Button */}
        <button type="submit" className="submit-button">Submit Order</button>
      </form>
    </div>
  );
};

export default AddOrder;
