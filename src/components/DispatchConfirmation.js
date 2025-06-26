import React, { useState, useEffect } from 'react';
import tripsService from '../services/tripsService';
import './DispatchConfirmation.css';

function DispatchConfirmation({ proposedTrips, onConfirm, onReject }) {
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    // Initialize with all trips selected
    setSelectedTrips(proposedTrips.map(trip => trip.id));
    setSelectAll(true);
    console.log('DispatchConfirmation mounted, proposedTrips:', proposedTrips);
  }, [proposedTrips]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedTrips(checked ? proposedTrips.map(trip => trip.id) : []);
  };

  const handleTripSelect = (tripId) => {
    setSelectedTrips(prev => {
      const newSelected = prev.includes(tripId)
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId];
      setSelectAll(newSelected.length === proposedTrips.length);
      return newSelected;
    });
  };

  const handleConfirm = async () => {
    try {
      setLocalError(null);
      console.log('User clicked confirm, selectedTrips:', selectedTrips);
      const response = await tripsService.confirmTrips(selectedTrips);
      onConfirm(response.trips);
    } catch (error) {
      setLocalError(error.response?.data?.error || 'Failed to confirm trips');
    }
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <div className="dispatch-confirmation">
      <h1>Confirm Dispatch</h1>
      <p>Please review and confirm the following trips:</p>
      {localError && <div style={{ color: 'red', marginBottom: 16 }}>{localError}</div>}

      <div className="confirmation-controls">
        <label className="select-all">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          Select All Trips
        </label>
      </div>

      <div className="proposed-trips">
        {proposedTrips.map(trip => (
          <div key={trip.id} className="trip-card">
            <div className="trip-header">
              <label className="trip-select">
                <input
                  type="checkbox"
                  checked={selectedTrips.includes(trip.id)}
                  onChange={() => handleTripSelect(trip.id)}
                />
                Trip #{trip.id}
              </label>
              <span className="trip-vehicle">
                Vehicle: {trip.vehicle?.plate_number || 'Unassigned'}
              </span>
            </div>

            <div className="trip-details">
              <div className="trip-orders">
                <h4>Orders ({trip.orders?.length || 0})</h4>
                <ul>
                  {trip.orders?.map(order => (
                    <li key={order.id}>
                      Order #{order.id}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="trip-route">
                <h4>Route Summary</h4>
                <p>Distance: {trip.total_distance} km</p>
                <p>Duration: {trip.estimated_duration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="confirmation-actions">
        <button
          className="confirm-button"
          onClick={handleConfirm}
          disabled={selectedTrips.length === 0}
        >
          Confirm Selected Trips
        </button>
        <button className="reject-button" onClick={handleReject}>
          Reject All
        </button>
      </div>
    </div>
  );
}

export default DispatchConfirmation; 