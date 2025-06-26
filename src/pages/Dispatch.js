import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../redux/notificationSlice';
import ordersService from '../services/ordersService';
import tripsService from '../services/tripsService';
import DispatchConfirmation from '../components/DispatchConfirmation';
import './Dispatch.css';

function Dispatch() {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [error, setError] = useState(null);
  const [proposedTrips, setProposedTrips] = useState(null);
  const [showProposal, setShowProposal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersService.getPendingOrders();
      setOrders(response);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrders(prev => {
      const isSelected = prev.some(o => o.id === order.id);
      if (isSelected) {
        return prev.filter(o => o.id !== order.id);
      } else {
        return [...prev, order];
      }
    });
  };

  const handleDispatch = async () => {
    setError(null);
    setShowThankYou(false);
    setShowProposal(false);
    setProposedTrips(null);

    if (selectedOrders.length === 0) {
      setError('Please select at least one order to dispatch');
      return;
    }

    try {
      const selectedOrderIds = selectedOrders.map(order => order.id);
      const response = await tripsService.proposeTrips(selectedOrderIds);
      if (response && response.proposed_trips && response.proposed_trips.length > 0) {
        setProposedTrips(response.proposed_trips);
        setShowProposal(true);
      } else {
        setError('No trips could be proposed for the selected orders.');
      }
    } catch (err) {
      setError('Failed to propose trips. Please try again.');
      dispatch(setNotification({
        message: 'Failed to propose trips. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleConfirmTrips = (confirmedTrips) => {
    setShowProposal(false);
    setProposedTrips(null);
    setSelectedOrders([]);
    setShowThankYou(true);
    fetchOrders();
    dispatch(setNotification({
      message: 'Trips confirmed successfully!',
      type: 'success'
    }));
  };

  const handleRejectTrips = () => {
    setShowProposal(false);
    setProposedTrips(null);
    dispatch(setNotification({
      message: 'Trips rejected',
      type: 'info'
    }));
  };

  if (showThankYou) {
    return (
      <div className="thank-you-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ background: '#e8f5e9', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <span style={{ color: '#43a047', fontSize: 36 }}>✔</span>
            </div>
          </div>
          <h2 style={{ color: '#222', marginBottom: 12 }}>Orders Dispatched Successfully!</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>
            The selected orders have been dispatched and are being processed. You can track their status in the Orders section.
          </p>
          <button
            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.75rem 2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
            onClick={() => setShowThankYou(false)}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (showProposal && proposedTrips) {
    return (
      <DispatchConfirmation
        proposedTrips={proposedTrips}
        onConfirm={handleConfirmTrips}
        onReject={handleRejectTrips}
      />
    );
  }

  return (
    <div className="dispatch-page">
      <h1>Dispatch Orders</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="dispatch-controls">
        <button
          className="dispatch-button"
          onClick={handleDispatch}
          disabled={selectedOrders.length === 0}
        >
          Dispatch Selected Orders ({selectedOrders.length})
        </button>
      </div>
      <div className="orders-grid">
        {orders.map(order => (
          <div
            key={order.id}
            className={`order-card ${selectedOrders.some(o => o.id === order.id) ? 'selected' : ''}`}
            onClick={() => handleOrderSelect(order)}
          >
            <h3>Order #{order.id}</h3>
            <p>Customer: {order.customer_name}</p>
            <p>Address: {order.delivery_address}</p>
            <p>Items: {order.items.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dispatch; 