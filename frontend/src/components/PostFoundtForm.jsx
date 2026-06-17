import React, { useState } from "react";
import { createItem } from "../api/items";

function PostFoundForm({ goHome }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [reportType] = useState("FOUND");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  console.log("🔥 SUBMIT FUNCTION TRIGGERED");
  e.preventDefault();

  if (!title.trim()) return;

  const formData = {
    title: title,
    description: description,
    category: category || "General",
    location: location,
    reportType: "FOUND",
    imageUrls: []
  };

  console.log("Sending to backend:", formData);

  try {
    setLoading(true);

    const response = await createItem(formData);

    console.log("Response:", response);

    alert("Found item posted successfully!");

    // reset form correctly
    setTitle("");
    setDescription("");
    setCategory("");
    setLocation("");

    goHome();

  } catch (err) {
    console.error(err);
    alert("Failed to post item");

  } finally {
    setLoading(false);
  }
};
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={goHome}
          >
            ← Back
          </button>

          <h2>Report Found Item</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          <label>Title</label>
          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Black Wallet"
            style={styles.input}
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            placeholder="Black wallet near library"
            style={styles.textarea}
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
            style={styles.input}
          >
            <option value="">Select</option>
            <option>Electronics</option>
            <option>Books</option>
            <option>Personal Items</option>
            <option>Bags</option>
            <option>Other</option>
          </select>

          <label>Location</label>
          <input
            value={location}
            onChange={(e)=>setLocation(e.target.value)}
            placeholder="Library"
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>

        </form>

      </div>
    </div>
  );
}

const styles = {
  page:{
    minHeight:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"#f5f7fb"
  },

  card:{
    width:"500px",
    padding:"25px",
    background:"white",
    borderRadius:"10px"
  },

  form:{
    display:"flex",
    flexDirection:"column",
    gap:"10px"
  },

  input:{
    padding:"12px"
  },

  textarea:{
    padding:"12px",
    minHeight:"100px"
  },

  button:{
    padding:"12px",
    cursor:"pointer"
  },

  backBtn:{
    marginBottom:"20px"
  }
};

export default PostFoundForm;