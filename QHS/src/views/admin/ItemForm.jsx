import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { FormControlLabel, Radio, RadioGroup, FormLabel } from "@mui/material";

export default function ItemForm() {
  const { id, equipmentID } = useParams(); // Extract id and equipmentID from the URL
  const navigate = useNavigate();

  const [item, setItem] = useState({
    id: null,
    equipment_id: equipmentID || "", // Use equipmentID from URL
    condition: "",
    isBorrowed: "false", // Default to "false" as a string
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  // Fetch item data if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/item/${id}`)
        .then(({ data }) => {
          setLoading(false);
          const itemData = data.data;
          console.log("API Response:", data);
          setItem({
            id: itemData.id, // Ensure the ID is set
            equipment_id: itemData.equipment_id,
            condition: itemData.condition,
            isBorrowed: itemData.isBorrowed?.toString() || "false", // Ensure isBorrowed is a string
          });
        })
        .catch((err) => {
          setLoading(false);
          console.error("Error fetching item data:", err);
        });
    }
  }, [id]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    setErrors(null); // Reset errors before submission

    const payload = {
      equipment_id: item.equipment_id,
      condition: item.condition,
      isBorrowed: item.isBorrowed, // Ensure isBorrowed is a string
    };

    try {
      if (item.id) {
        // Use PUT for updates
        await axiosClient.put(`/item/${item.id}`, payload);
      } else {
        // Use POST for creating a new item
        await axiosClient.post("/item", payload);
      }
      navigate(`/admin/equipment/info/${item.equipment_id}`);
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
      } else {
        console.error("Server Error:", response?.data || err.message);
        setErrors({ general: ["An unexpected error occurred. Please try again."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Back Button */}
      <Link to={`/admin/equipment/info/${equipmentID}`}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "maroon",
            borderColor: "maroon",
            marginBottom: 2,
            "&:hover": {
              borderColor: "maroon",
              backgroundColor: "rgba(128, 0, 0, 0.04)",
            },
          }}
        >
          Back
        </Button>
      </Link>

      {/* Form Title */}
      {item.id ? <h1>Update Item</h1> : <h1>New Item</h1>}

      <div className="card animated fadeInDown">
        {loading && <div className="text-center">Loading...</div>}
        {errors && (
          <div className="alert">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        )}
        {!loading && (
          <form onSubmit={onSubmit}>
            {/* Equipment ID (Hidden Input) */}
            <input
              type="hidden"
              name="equipment_id"
              value={item.equipment_id}
              readOnly // Ensure the field is read-only
            />

            {/* Condition Field as Radio Buttons */}
            <FormLabel id="condition-radio-buttons-group-label">Condition</FormLabel>
            <RadioGroup
              aria-labelledby="condition-radio-buttons-group-label"
              name="condition-radio-buttons-group"
              value={item.condition}
              onChange={(ev) =>
                setItem({ ...item, condition: ev.target.value })
              }
            >
              <FormControlLabel value="New" control={<Radio />} label="New" />
              <FormControlLabel value="Used" control={<Radio />} label="Used" />
              <FormControlLabel value="Damaged" control={<Radio />} label="Damaged" />
            </RadioGroup>

            {/* Borrowed Status Field as Radio Buttons */}
            <FormLabel id="borrowed-radio-buttons-group-label">Borrowed Status</FormLabel>
            <RadioGroup
              aria-labelledby="borrowed-radio-buttons-group-label"
              name="borrowed-radio-buttons-group"
              value={item.isBorrowed} // Ensure value is a string
              onChange={(ev) =>
                setItem({ ...item, isBorrowed: ev.target.value }) // Set as string
              }
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>

            {/* Save Button */}
            <button className="btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}