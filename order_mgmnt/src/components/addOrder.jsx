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
  const [orderQty, setOrderQty] = useState(''); // New state for Order Quantity
  const [size_S, setSizeS] = useState(0); // Size S
  const [size_M, setSizeM] = useState(0); // Size M
  const [size_L, setSizeL] = useState(0); // Size L
  const [size_XL, setSizeXL] = useState(0); // Size XL
  const [size_XXL, setSizeXXL] = useState(0); // Size XXL
  const [size_3XL, setSize3XL] = useState(0); // Size 3XL
  const [size_4XL, setSize4XL] = useState(0); // Size 4XL
  const [size_5XL, setSize5XL] = useState(0); // Size 5XL
  const [invoice, setInvoice] = useState(''); // New Invoice field
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState(null);

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
    formData.append('orderQty', orderQty);
    formData.append('size_S', size_S);
    formData.append('size_M', size_M);
    formData.append('size_L', size_L);
    formData.append('size_XL', size_XL);
    formData.append('size_XXL', size_XXL);
    formData.append('size_3XL', size_3XL);
    formData.append('size_4XL', size_4XL);
    formData.append('size_5XL', size_5XL);
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

        {/* Size Inputs */}
        <div className="form-group">
          <label htmlFor="size_S">Size S:</label>
          <input
            type="number"
            id="size_S"
            value={size_S}
            onChange={(e) => setSizeS(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_M">Size M:</label>
          <input
            type="number"
            id="size_M"
            value={size_M}
            onChange={(e) => setSizeM(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_L">Size L:</label>
          <input
            type="number"
            id="size_L"
            value={size_L}
            onChange={(e) => setSizeL(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_XL">Size XL:</label>
          <input
            type="number"
            id="size_XL"
            value={size_XL}
            onChange={(e) => setSizeXL(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_XXL">Size XXL:</label>
          <input
            type="number"
            id="size_XXL"
            value={size_XXL}
            onChange={(e) => setSizeXXL(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_3XL">Size 3XL:</label>
          <input
            type="number"
            id="size_3XL"
            value={size_3XL}
            onChange={(e) => setSize3XL(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_4XL">Size 4XL:</label>
          <input
            type="number"
            id="size_4XL"
            value={size_4XL}
            onChange={(e) => setSize4XL(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size_5XL">Size 5XL:</label>
          <input
            type="number"
            id="size_5XL"
            value={size_5XL}
            onChange={(e) => setSize5XL(e.target.value)}
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
