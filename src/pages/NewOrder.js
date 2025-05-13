import React from "react";
import { useState } from "react";
import "../styles/NewOrder.css";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import LaptopIcon from "@mui/icons-material/Laptop";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function NewOrder() {
  const [selectedType, setSelectedType] = useState(null); // 'inbound' or 'outbound'
  const [selectedOption, setSelectedOption] = useState(null); // 'portal' or 'excel'

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

  const handleCardClick = (type) => {
    setSelectedType(type);
    setSelectedOption(null);
  };

  const handleBack = () => {
    if (selectedOption) {
      setSelectedOption(null);
    } else {
      setSelectedType(null);
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  if (selectedOption === "portal") {
    return (
      <div className="container">
        <button className="back-button" onClick={handleBack}>
          <ArrowBackIcon />
          Back to Options
        </button>
        <OrderForm type={selectedType} />
      </div>
    );
  }

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
              onClick={() => handleOptionClick("portal")}
            />
            <OptionCard
              title="Excel Sheets"
              instructions={excelInstructions}
              note="If more than 10 items"
              buttonText="Excel Sheets"
              icon="excel"
              onClick={() => handleOptionClick("excel")}
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
            onClick={() => handleCardClick("outbound")}
            style={{ cursor: "pointer" }}
          >
            <OutboundCard />
          </div>
          <div
            onClick={() => handleCardClick("inbound")}
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

function OrderForm({ type }) {
  const [orderId] = useState("FB0204819");
  const [warehouse, setWarehouse] = useState("");
  const [date, setDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [destination, setDestination] = useState("");
  const [products, setProducts] = useState([]);
  const [showNewProductCard, setShowNewProductCard] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      orderId,
      type,
      warehouse,
      date,
      pickupTime,
      destination,
      products,
    });
  };

  const handleAddProductClick = () => {
    setShowNewProductCard(true);
  };

  const handleProductAdded = (newProduct) => {
    setProducts([...products, { ...newProduct, quantity: 1 }]);
    setShowNewProductCard(false);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: parseInt(newQuantity) || 0,
    };
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  if (showNewProductCard) {
    return (
      <div className="order-form-container">
        <button
          className="back-button"
          onClick={() => setShowNewProductCard(false)}
        >
          <ArrowBackIcon />
          Back to Order Form
        </button>
        <NewProductCard
          onCancel={() => setShowNewProductCard(false)}
          onProductAdded={handleProductAdded}
        />
      </div>
    );
  }

  return (
    <div className="order-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Order ID</label>
            <input type="text" value={orderId} className="form-input" />
          </div>

          <div className="form-group">
            <label>warehouse</label>
            <div className="select-wrapper">
              <select
                className="form-input"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
              >
                <option value="">Select warehouse</option>
                <option value="warehouse1">Warehouse 1</option>
                <option value="warehouse2">Warehouse 2</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <div className="input-with-icon">
              <input
                type="date"
                placeholder="Select date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Pickup Time</label>
            <input
              type="text"
              placeholder="Enter pickup time"
              className="form-input"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label>Distination</label>
            <input
              type="text"
              placeholder="Enter destination"
              className="form-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="divider">
          <button
            type="button"
            className="add-product-button"
            onClick={handleAddProductClick}
          >
            ADD PRODUCT
          </button>
        </div>

        {/* Display added products */}
        <div className="product-cards-container">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              index={index}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveProduct}
            />
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="create-order-button">
            Create Order
          </button>
        </div>
      </form>
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

function NewProductCard({ onCancel, onProductAdded }) {
  const [formData, setFormData] = useState({
    sku: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    minMaxTemp: false,
    minTemp: "",
    maxTemp: "",
    boxType: "",
    location: "",
    category: "",
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDimensionChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New product form submitted:", formData);
    onProductAdded(formData);
  };

  const handleCancel = () => {
    setFormData({
      sku: "",
      length: "",
      width: "",
      height: "",
      weight: "",
      minMaxTemp: false,
      minTemp: "",
      maxTemp: "",
      boxType: "",
      location: "",
      category: "",
    });
    onCancel();
  };

  return (
    <div className="product-container">
      <form className="new-product-card" onSubmit={handleSubmit}>
        <h1 className="product-title">Add new product</h1>

        <div className="add-new-product-form-group">
          <label htmlFor="sku" className="product-label">
            SKU Name
          </label>
          <input
            id="sku"
            className="product-input-field"
            value={formData.sku}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-product-form-group">
          <label className="product-label">Dimensions</label>
          <div className="product-dimensions-container">
            <input
              id="length"
              type="number"
              className="product-dimension-box"
              placeholder="LENGTH"
              value={formData.length}
              onChange={handleDimensionChange}
              required
            />
            <span className="product-dimension-separator">X</span>
            <input
              id="width"
              type="number"
              className="product-dimension-box"
              placeholder="WIDTH"
              value={formData.width}
              onChange={handleDimensionChange}
              required
            />
            <span className="product-dimension-separator">X</span>
            <input
              id="height"
              type="number"
              className="product-dimension-box"
              placeholder="HEIGHT"
              value={formData.height}
              onChange={handleDimensionChange}
              required
            />
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="weight" className="product-label">
            Weight
          </label>
          <input
            id="weight"
            type="number"
            className="product-input-field"
            value={formData.weight}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-product-form-group">
          <div className="product-checkbox-container">
            <input
              type="checkbox"
              id="minMaxTemp"
              checked={formData.minMaxTemp}
              onChange={handleInputChange}
              className="product-checkbox"
            />
            <label htmlFor="minMaxTemp" className="product-checkbox-label">
              MIN/MAX Temp.
            </label>
          </div>
        </div>

        {formData.minMaxTemp && (
          <div className="product-temp-range">
            <div className="add-new-product-form-group">
              <label className="product-label">FROM</label>
              <input
                id="minTemp"
                type="number"
                className="product-input-field product-temp-input"
                value={formData.minTemp}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="add-new-product-form-group">
              <label className="product-label">TO</label>
              <input
                id="maxTemp"
                type="number"
                className="product-input-field product-temp-input"
                value={formData.maxTemp}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}

        <div className="add-new-product-form-group">
          <label htmlFor="boxType" className="product-label">
            Box Type
          </label>
          <div className="product-select-wrapper">
            <select
              id="boxType"
              className="product-select-field"
              value={formData.boxType}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select box type
              </option>
              <option value="standard">Standard</option>
              <option value="custom">Custom</option>
              <option value="special">Special</option>
            </select>
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="location" className="product-label">
            Current Location
          </label>
          <div className="product-select-wrapper">
            <select
              id="location"
              className="product-select-field"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select location
              </option>
              <option value="warehouse1">Warehouse 1</option>
              <option value="warehouse2">Warehouse 2</option>
              <option value="store">Store</option>
            </select>
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="category" className="product-label">
            Category
          </label>
          <div className="product-select-wrapper">
            <select
              id="category"
              className="product-select-field"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select category
              </option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="product-actions">
          <button
            type="submit"
            className="new-product-button product-add-button"
          >
            Add Product
          </button>
          <button
            type="button"
            className="product-cancel-link"
            onClick={handleCancel}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
