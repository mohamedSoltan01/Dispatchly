import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/NewOrder.css";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import LaptopIcon from "@mui/icons-material/Laptop";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Typography, Button } from "@mui/material";
import {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} from "../styles/designSystem";
import { useNavigate } from "react-router-dom";

export default function NewOrder({ selectedProducts, onClearProducts }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(() => {
    const saved = localStorage.getItem("newOrderType");
    return saved || "";
  });
  const [selectedOption, setSelectedOption] = useState(() => {
    const saved = localStorage.getItem("newOrderOption");
    return saved || "";
  });
  const [showOrderForm, setShowOrderForm] = useState(() => {
    const type = localStorage.getItem("newOrderType");
    const option = localStorage.getItem("newOrderOption");
    return Boolean(type && option === "portal");
  });
  const updateInProgress = useRef(false);

  // Cleanup function to clear all saved state
  const clearAllState = useCallback(() => {
    const keysToRemove = [
      "newOrderType",
      "newOrderOption",
      "orderWarehouse",
      "orderDate",
      "orderPickupTime",
      "orderDestination",
      "orderProducts",
      "selectedProducts",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    onClearProducts();
  }, [onClearProducts]);

  // Handle type selection
  const handleTypeSelect = useCallback((type) => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      setSelectedType(type);
      localStorage.setItem("newOrderType", type);
      setSelectedOption("");
      localStorage.removeItem("newOrderOption");
      setShowOrderForm(false);
    } finally {
      updateInProgress.current = false;
    }
  }, []);

  // Handle option selection
  const handleOptionSelect = useCallback((option) => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      setSelectedOption(option);
      localStorage.setItem("newOrderOption", option);
      // Only show order form for portal option
      setShowOrderForm(option === "portal");
    } finally {
      updateInProgress.current = false;
    }
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      if (showOrderForm || selectedOption === "portal") {
        // If we're in the order form, go back to options
        setShowOrderForm(false);
        setSelectedOption("");
        localStorage.removeItem("newOrderOption");
      } else if (selectedOption === "excel") {
        // If we're in excel view, go back to options
        setSelectedOption("");
        localStorage.removeItem("newOrderOption");
      } else if (selectedType) {
        // If we're in options, go back to type selection
        setSelectedType("");
        localStorage.removeItem("newOrderType");
      }
      onClearProducts();
    } finally {
      updateInProgress.current = false;
    }
  }, [showOrderForm, selectedType, selectedOption, onClearProducts]);

  // Handle successful order submission
  const handleOrderSuccess = useCallback(() => {
    clearAllState();
  }, [clearAllState]);

  // Handle selectedProducts changes
  useEffect(() => {
    if (selectedProducts && selectedProducts.length > 0 && showOrderForm) {
      const existingProducts = JSON.parse(
        localStorage.getItem("orderProducts") || "[]"
      );
      const existingIds = new Set(existingProducts.map((p) => p.id));

      const newProducts = selectedProducts
        .filter((p) => !existingIds.has(p.id))
        .map((p) => ({
          ...p,
          quantity: 1,
        }));

      if (newProducts.length > 0) {
        const updatedProducts = [...existingProducts, ...newProducts];
        localStorage.setItem("orderProducts", JSON.stringify(updatedProducts));
      }
    }
  }, [selectedProducts, showOrderForm]);

  const portalInstructions = [
    "Add items through portal",
    "- select the item name & code",
    "- Enter the expected quantity",
    "- Select the UOM",
  ];

  const excelInstructions = [
    "To upload items Excel sheet:",
    "- Download the template",
    "- Fill out it ( item name & code-expected quantity-UOM)",
    "- Upload the file",
  ];

  if (selectedOption === "excel") {
    return (
      <div className="container">
        <button className="back-button" onClick={handleBack}>
          <ArrowBackIcon />
          Back to Options
        </button>
        <ExcelUpload
          onFileChange={(file) => console.log("File changed:", file)}
          onSubmit={() => console.log("Submit excel")}
        />
      </div>
    );
  }

  if (selectedOption === "portal" || showOrderForm) {
    return (
      <div className="container">
        <button className="back-button" onClick={handleBack}>
          <ArrowBackIcon />
          Back to Options
        </button>
        <OrderForm
          type={selectedType}
          selectedProducts={selectedProducts}
          onTypeChange={handleTypeSelect}
          onOptionChange={handleOptionSelect}
          onClearProducts={onClearProducts}
          onOrderSuccess={handleOrderSuccess}
        />
      </div>
    );
  }

  if (selectedType) {
    return (
      <div className="container">
        <main className="main-content">
          <button className="back-button" onClick={handleBack}>
            <ArrowBackIcon />
            Back to Selection
          </button>
          <div className="card-grid">
            <OptionCard
              title="Add items through portal"
              instructions={portalInstructions}
              note="Recommended"
              buttonText="Portal"
              icon="laptop"
              onClick={() => handleOptionSelect("portal")}
            />
            <OptionCard
              title="Excel Sheets"
              instructions={excelInstructions}
              note="If more than 10 items"
              buttonText="Excel Sheets"
              icon="excel"
              onClick={() => handleOptionSelect("excel")}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main className="main-content">
        <div className="card-grid">
          <div
            onClick={() => handleTypeSelect("outbound")}
            style={{ cursor: "pointer" }}
          >
            <OutboundCard />
          </div>
          <div
            onClick={() => handleTypeSelect("inbound")}
            style={{ cursor: "pointer" }}
          >
            <InboundCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function OutboundCard() {
  return (
    <div className="card">
      <div className="card-illustration">
        <div className="illustration-container">
          {/* Package icon */}
          <div className="package-icon small">
            <div className="package-bookmark"></div>
          </div>

          {/* Location pins with arrows */}
          <div className="location-pins">
            <div className="pin-container">
              <div className="location-pin">
                <FmdGoodOutlinedIcon style={{ fontSize: 20, color: "white" }} />
              </div>
            </div>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="arrow"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="location-pin">
              <FmdGoodOutlinedIcon style={{ fontSize: 20, color: "white" }} />
            </div>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="arrow"
            >
              <path
                d="M19 12H5M5 12L12 5M5 12L12 19"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="location-pin">
              <FmdGoodOutlinedIcon style={{ fontSize: 20, color: "white" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="card-content">
        <h3 className="card-title">Outbound</h3>
        <p className="card-description">
          Distribute packages to supplier drop offs
        </p>
      </div>
    </div>
  );
}

function InboundCard() {
  return (
    <div className="card">
      <div className="card-illustration">
        <div className="illustration-container">
          {/* Package icon */}
          <div className="package-icon large">
            <div className="package-bookmark"></div>
            <div className="package-line"></div>
          </div>

          {/* Location pin with arrows */}
          <div className="inbound-pin-container">
            <div className="inbound-pins">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="arrow"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="location-pin large">
                <FmdGoodOutlinedIcon style={{ fontSize: 24, color: "white" }} />
              </div>

              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="arrow"
              >
                <path
                  d="M19 12H5M5 12L12 5M5 12L12 19"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="card-content">
        <h3 className="card-title">Inbound</h3>
        <p className="card-description">
          Collect packages from supplier warehouse to your wharehouse
        </p>
      </div>
    </div>
  );
}

function OptionCard({ title, instructions, note, buttonText, icon, onClick }) {
  return (
    <div className="option-card">
      <div className="option-card-content">
        <div className="option-card-header">
          {icon === "laptop" ? (
            <LaptopIcon className="option-card-icon" style={{ fontSize: 24 }} />
          ) : (
            <NoteAddOutlinedIcon
              className="option-card-icon"
              style={{ fontSize: 24 }}
            />
          )}
          <h2 className="option-card-title">{title}</h2>
        </div>

        <div className="option-card-instructions">
          {instructions.map((instruction, index) => (
            <p key={index}>{instruction}</p>
          ))}
        </div>

        <p className="option-card-note">{note}</p>
      </div>

      <button className="option-card-button" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
}

function ProductCard({ product, index, onQuantityChange, onRemove }) {
  return (
    <div className="product-card">
      <h3>PRODUCT {index + 1}</h3>
      <div className="product-details">
        <p>
          <strong>SKU:</strong> {product.sku}
        </p>
        <p>
          <strong>Dimensions:</strong> {product.length}x{product.width}x
          {product.height}
        </p>
        <p>
          <strong>Weight:</strong> {product.weight}
        </p>
        {product.minMaxTemp && (
          <p>
            <strong>Temperature Range:</strong> {product.minTemp}°C to{" "}
            {product.maxTemp}°C
          </p>
        )}
        <p>
          <strong>Box Type:</strong> {product.boxType}
        </p>
        <p>
          <strong>Location:</strong> {product.location}
        </p>
        <p>
          <strong>Category:</strong> {product.category}
        </p>
        <div className="product-form-group">
          <label>Item Quantity</label>
          <input
            type="number"
            className="product-input"
            min="1"
            value={product.quantity}
            onChange={(e) => onQuantityChange(index, e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        className="remove-product-button"
        onClick={() => onRemove(index)}
      >
        Remove
      </button>
    </div>
  );
}

// Function to generate a unique order ID
const generateUniqueOrderId = () => {
  // Get all existing orders from localStorage
  const existingOrders = JSON.parse(
    localStorage.getItem("dispatchOrders") || "[]"
  );
  const existingIds = new Set(existingOrders.map((order) => order.id));

  // Generate a new ID and check if it exists
  let newId;
  do {
    // Format: FB + random 6 digits
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    newId = `FB${randomNum}`;
  } while (existingIds.has(newId));

  return newId;
};

function OrderForm({
  type,
  selectedProducts,
  onTypeChange,
  onOptionChange,
  onClearProducts,
  onOrderSuccess,
}) {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(() => {
    // Generate a unique ID when the component mounts
    return generateUniqueOrderId();
  });
  const [warehouse, setWarehouse] = useState(() => {
    const saved = localStorage.getItem("orderWarehouse");
    return saved || "";
  });
  const [date, setDate] = useState(() => {
    const saved = localStorage.getItem("orderDate");
    if (saved) return saved;

    // Direct date initialization
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [pickupTime, setPickupTime] = useState(() => {
    const saved = localStorage.getItem("orderPickupTime");
    return saved || "";
  });
  const [destination, setDestination] = useState(() => {
    const saved = localStorage.getItem("orderDestination");
    return saved || "";
  });
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("orderProducts");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing saved products:", e);
      return [];
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [errors, setErrors] = useState({});
  const updateInProgress = useRef(false);

  // Handle selectedProducts changes
  useEffect(() => {
    if (!selectedProducts?.length || updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      // Get current products from localStorage
      const currentProducts = JSON.parse(
        localStorage.getItem("orderProducts") || "[]"
      );
      const currentIds = new Set(currentProducts.map((p) => p.id));

      // Filter out products that are already in the list
      const newProducts = selectedProducts
        .filter((p) => !currentIds.has(p.id))
        .map((p) => ({
          ...p,
          quantity: 1,
        }));

      if (newProducts.length > 0) {
        // Combine existing and new products
        const updatedProducts = [...currentProducts, ...newProducts];

        // Update both state and localStorage
        setProducts(updatedProducts);
        localStorage.setItem("orderProducts", JSON.stringify(updatedProducts));
      }

      // Clear selected products after adding them to the order
      onClearProducts();
    } catch (error) {
      console.error("Error updating products:", error);
    } finally {
      updateInProgress.current = false;
    }
  }, [selectedProducts, onClearProducts]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleWarehouseChange = useCallback((e) => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      const value = e.target.value;
      setWarehouse(value);
      if (value) {
        localStorage.setItem("orderWarehouse", value);
      } else {
        localStorage.removeItem("orderWarehouse");
      }
    } finally {
      updateInProgress.current = false;
    }
  }, []);

  const handleDateChange = useCallback((e) => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      const value = e.target.value;
      setDate(value);
      if (value) {
        localStorage.setItem("orderDate", value);
      } else {
        localStorage.removeItem("orderDate");
      }
    } finally {
      updateInProgress.current = false;
    }
  }, []);

  const handlePickupTimeChange = useCallback((e) => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      const value = e.target.value;
      setPickupTime(value);
      if (value) {
        localStorage.setItem("orderPickupTime", value);
      } else {
        localStorage.removeItem("orderPickupTime");
      }
    } finally {
      updateInProgress.current = false;
    }
  }, []);

  const handleDestinationChange = useCallback((e) => {
    if (updateInProgress.current) return;

    updateInProgress.current = true;
    try {
      const value = e.target.value;
      setDestination(value);
      if (value) {
        localStorage.setItem("orderDestination", value);
      } else {
        localStorage.removeItem("orderDestination");
      }
    } finally {
      updateInProgress.current = false;
    }
  }, []);

  const handleQuantityChange = useCallback(
    (productId, newQuantity) => {
      if (updateInProgress.current) return;

      updateInProgress.current = true;
      try {
        const updatedProducts = products.map((product) =>
          product.id === productId
            ? { ...product, quantity: Math.max(1, parseInt(newQuantity) || 1) }
            : product
        );

        setProducts(updatedProducts);
        localStorage.setItem("orderProducts", JSON.stringify(updatedProducts));
      } finally {
        updateInProgress.current = false;
      }
    },
    [products]
  );

  const handleRemoveProduct = useCallback(
    (productId) => {
      if (updateInProgress.current) return;

      updateInProgress.current = true;
      try {
        const updatedProducts = products.filter(
          (product) => product.id !== productId
        );
        setProducts(updatedProducts);
        localStorage.setItem("orderProducts", JSON.stringify(updatedProducts));
      } finally {
        updateInProgress.current = false;
      }
    },
    [products]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (updateInProgress.current) return;

      updateInProgress.current = true;
      try {
        const newErrors = {};
        if (!warehouse) newErrors.warehouse = "Warehouse is required";
        if (!date) newErrors.date = "Date is required";
        if (!pickupTime) newErrors.pickupTime = "Pickup time is required";
        if (!destination) newErrors.destination = "Destination is required";
        if (products.length === 0) {
          newErrors.products = "At least one product is required";
        }

        // Verify order ID is still unique before submission
        const existingOrders = JSON.parse(
          localStorage.getItem("dispatchOrders") || "[]"
        );
        if (existingOrders.some((order) => order.id === orderId)) {
          // If ID is no longer unique, generate a new one
          const newOrderId = generateUniqueOrderId();
          setOrderId(newOrderId);
          newErrors.submit =
            "Order ID was updated. Please try submitting again.";
          setErrors(newErrors);
          return;
        }

        // Direct date comparison
        if (date) {
          const today = new Date();
          const selectedDate = new Date(date);
          today.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            newErrors.date = "Cannot select a past date";
          }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
          return;
        }

        setIsSubmitting(true);

        // Calculate total weight
        const totalWeight = products.reduce((sum, product) => {
          const weight = parseFloat(product.weight) || 0;
          return sum + weight * product.quantity;
        }, 0);

        // Create order details object with the unique ID
        const orderDetails = {
          id: orderId, // This is now guaranteed to be unique
          customer: "Customer Name", // Mock data until backend integration
          departureLocation: warehouse,
          type: type === "inbound" ? "Inbound" : "Outbound",
          weight: `${totalWeight} kg`,
          arrivalLocation: destination,
          arrivalDate: date,
          pickupTime: pickupTime,
          status: "pending", // Add status field
          dispatchedAt: null, // Add dispatchedAt field
          products: products.map((product) => ({
            skuName: product.skuName,
            quantity: product.quantity,
            productId: product.id,
            dimensions: product.dimensions,
            weight: product.weight,
            temperature: product.temperature,
            boxType: product.boxType,
            location: product.currentLocation,
            category: product.category,
          })),
        };

        // Save to dispatch orders list
        try {
          const existingOrders = JSON.parse(
            localStorage.getItem("dispatchOrders") || "[]"
          );
          const updatedOrders = [...existingOrders, orderDetails];
          localStorage.setItem("dispatchOrders", JSON.stringify(updatedOrders));
        } catch (error) {
          console.error("Error saving order to dispatch list:", error);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Show thank you message
        setShowThankYou(true);

        // Clear form data but don't navigate
        onOrderSuccess();
      } catch (error) {
        console.error("Error submitting order:", error);
        setErrors({ submit: "Failed to submit order. Please try again." });
      } finally {
        setIsSubmitting(false);
        updateInProgress.current = false;
      }
    },
    [
      products,
      warehouse,
      date,
      pickupTime,
      destination,
      type,
      orderId,
      onOrderSuccess,
    ]
  );

  if (showThankYou) {
    return (
      <div className="order-form-container">
        <div
          className="thank-you-screen"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            backgroundColor: colors.background.paper,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.md,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              backgroundColor: `${colors.success}15`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircleIcon
              style={{
                fontSize: 32,
                color: colors.success,
              }}
            />
          </div>
          <Typography
            variant="h4"
            sx={{
              ...typography.h3,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
          >
            Order Created Successfully!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              ...typography.body1,
              color: colors.text.secondary,
              marginBottom: spacing.xl,
              maxWidth: "400px",
              margin: "0 auto 32px",
            }}
          >
            Your order has been created and is being processed. You can track
            its status in the Orders section.
          </Typography>
          <div
            style={{
              display: "flex",
              gap: spacing.md,
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "12px 24px",
                backgroundColor: colors.background.paper,
                color: colors.text.primary,
                border: `1px solid ${colors.border.main}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                ...typography.button,
                "&:hover": {
                  backgroundColor: colors.background.default,
                },
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Order ID</label>
            <input
              type="text"
              value={orderId}
              className="form-input"
              disabled
            />
          </div>

          <div className="form-group">
            <label>Warehouse</label>
            <div className="select-wrapper">
              <select
                className={`form-input ${errors.warehouse ? "error" : ""}`}
                value={warehouse}
                onChange={handleWarehouseChange}
              >
                <option value="">Select warehouse</option>
                <option value="warehouse1">Warehouse 1</option>
                <option value="warehouse2">Warehouse 2</option>
              </select>
              {errors.warehouse && (
                <span className="error-message">{errors.warehouse}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <div className="input-with-icon">
              <input
                type="date"
                placeholder="Select date"
                className={`form-input ${errors.date ? "error" : ""}`}
                value={date}
                min={(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                })()}
                onChange={handleDateChange}
              />
              {errors.date && (
                <span className="error-message">{errors.date}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Pickup Time</label>
            <input
              type="time"
              placeholder="Enter pickup time"
              className={`form-input ${errors.pickupTime ? "error" : ""}`}
              value={pickupTime}
              onChange={handlePickupTimeChange}
            />
            {errors.pickupTime && (
              <span className="error-message">{errors.pickupTime}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label>Destination</label>
            <input
              type="text"
              placeholder="Enter destination"
              className={`form-input ${errors.destination ? "error" : ""}`}
              value={destination}
              onChange={handleDestinationChange}
            />
            {errors.destination && (
              <span className="error-message">{errors.destination}</span>
            )}
          </div>
        </div>

        <div className="divider">
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              // Save current form state before navigating
              const formState = {
                warehouse,
                date,
                pickupTime,
                destination,
                products,
              };

              // Save all form state at once
              Object.entries(formState).forEach(([key, value]) => {
                if (key === "products") {
                  localStorage.setItem("orderProducts", JSON.stringify(value));
                } else {
                  localStorage.setItem(
                    `order${key.charAt(0).toUpperCase() + key.slice(1)}`,
                    value
                  );
                }
              });

              // Clear any existing selected products before navigating
              onClearProducts();

              // Navigate to products page in selection mode
              navigate("/products?mode=select");
            }}
            className="add-product-button"
          >
            {products.length > 0 ? "Add More Products" : "Select Products"}
          </Button>
          {errors.products && (
            <span
              className="error-message"
              style={{ display: "block", marginTop: "8px" }}
            >
              {errors.products}
            </span>
          )}
        </div>

        <div className="product-cards-container">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <h3>{product.skuName || product.name}</h3>
                <button
                  type="button"
                  className="remove-product-button"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  Remove
                </button>
              </div>
              <div className="product-details">
                <div className="product-info">
                  <p>
                    <strong>Product ID:</strong> {product.id}
                  </p>
                  <p>
                    <strong>Dimensions:</strong>{" "}
                    {product.dimensions ||
                      `${product.length}x${product.width}x${product.height}`}
                  </p>
                  <p>
                    <strong>Weight:</strong> {product.weight} kg
                  </p>
                  {product.temperature && (
                    <p>
                      <strong>Temperature:</strong> {product.temperature}
                    </p>
                  )}
                  <p>
                    <strong>Box Type:</strong> {product.boxType}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {product.currentLocation || product.location}
                  </p>
                  <p>
                    <strong>Category:</strong> {product.category}
                  </p>
                </div>
                <div className="product-quantity">
                  <label htmlFor={`quantity-${product.id}`}>Quantity:</label>
                  <input
                    id={`quantity-${product.id}`}
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) =>
                      handleQuantityChange(product.id, e.target.value)
                    }
                    className="quantity-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.submit && (
          <div
            className="error-message"
            style={{
              textAlign: "center",
              marginBottom: spacing.md,
              color: colors.error,
            }}
          >
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="create-order-button"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              position: "relative",
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ visibility: "hidden" }}>Create Order</span>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 20,
                    height: 20,
                    border: `2px solid ${colors.text.white}`,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </>
            ) : (
              "Create Order"
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function ExcelUpload({ onFileChange, onSubmit }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const isExcel = droppedFile.name.match(/\.(xlsx|xls|csv)$/i);

      if (isExcel) {
        setFile(droppedFile);
        onFileChange(droppedFile);
      } else {
        alert("Please upload an Excel file (.xlsx, .xls, or .csv)");
      }
    }
  };

  const handleDownloadTemplate = () => {
    // In a real application, this would download an actual templatek
    alert("Template download functionality would be implemented here");
  };

  const handleSubmit = () => {
    if (file) {
      onSubmit();
    } else {
      alert("Please select a file before submitting");
    }
  };

  return (
    <div className="excel-upload-container">
      <div className="excel-upload-header">
        <div>
          <h3 className="excel-upload-title">Excel sheets</h3>
          <p className="excel-upload-description">
            Download and fill out the template and upload it to transfer data
            from your Excel sheets
          </p>
        </div>
        <button
          className="download-template-button"
          onClick={handleDownloadTemplate}
        >
          Download Template
        </button>
      </div>

      <div
        className={`upload-area ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <UnarchiveOutlinedIcon style={{ fontSize: 32 }} />
        </div>
        <p className="upload-title">Click or drag Excel sheet file</p>
        <p className="upload-subtitle">Support for a single file upload</p>

        <input
          type="file"
          id="file-upload"
          className="file-input"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="file-label">
          {file ? (
            <span className="file-name">{file.name}</span>
          ) : (
            <span className="browse-text">Browse</span>
          )}
        </label>
      </div>

      <div className="submit-container">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!file}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
