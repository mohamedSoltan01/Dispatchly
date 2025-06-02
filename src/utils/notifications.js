// Helper function to get a unique ID for new notifications
const getNewId = (notifications) => {
  const maxId = notifications.reduce((max, n) => Math.max(max, n.id), 0);
  return maxId + 1;
};

// Helper function to add a new notification
export const addNotification = (type, details) => {
  try {
    // Get existing notifications
    const notifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );

    // Create notification message based on type
    let title;
    switch (type) {
      case "new_order":
        title = `New order #${details.orderId} has been created`;
        break;
      case "dispatch_order":
        title = `Order #${details.orderId} has been dispatched`;
        break;
      case "new_user":
        title = `New user ${details.userName} has been added`;
        break;
      case "new_organization":
        title = `New organization ${details.orgName} has been added`;
        break;
      case "new_location":
        title = `New location ${details.locationName} has been added`;
        break;
      case "new_product":
        title = `New product ${details.productName} has been added`;
        break;
      case "new_car":
        title = `New vehicle ${details.plateNumber} has been added to the fleet`;
        break;
      default:
        title = "New notification";
    }

    // Create new notification object
    const newNotification = {
      id: getNewId(notifications),
      title,
      timestamp: new Date().toISOString(),
      type,
      read: false,
      details, // Store additional details for future use
    };

    // Add to beginning of array (most recent first)
    const updatedNotifications = [newNotification, ...notifications];

    // Save to localStorage
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    // Trigger storage event for other tabs
    window.dispatchEvent(new Event("storage"));

    return true;
  } catch (error) {
    console.error("Error adding notification:", error);
    return false;
  }
};
