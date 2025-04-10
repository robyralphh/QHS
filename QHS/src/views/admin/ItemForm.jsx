import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { FormControlLabel, Radio, RadioGroup, FormLabel } from "@mui/material";

export default function ItemForm() {
  const { id, equipmentID } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState({
    id: null,
    equipment_id: equipmentID || "",
    unit_id: "",
    condition: "",
    isBorrowed: "false",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/item/${id}`)
        .then(({ data }) => {
          setLoading(false);
          const itemData = data.data;
          if (!itemData) {
            console.error("Item data not found in response:", data);
            setErrors({ general: ["Item not found."] });
            return;
          }
          console.log("API Response:", data);
          setItem({
            id: itemData.id,
            equipment_id: itemData.equipment_id,
            unit_id: itemData.unit_id || "",
            condition: itemData.condition,
            isBorrowed: itemData.isBorrowed?.toString() || "false",
          });
        })
        .catch((err) => {
          setLoading(false);
          console.error("Error fetching item data:", err);
          setErrors({ general: ["Failed to fetch item data."] });
        });
    }
  }, [id]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    setErrors(null);

    const payload = {
      equipment_id: item.equipment_id,
      condition: item.condition,
      isBorrowed: item.isBorrowed,
    };

    try {
      if (item.id) {
        await axiosClient.put(`/item/${item.id}`, payload);
      } else {
        const response = await axiosClient.post("/item", payload);
        const newUnitId = response?.data?.data?.unit_id || "";
        setItem({ ...item, unit_id: newUnitId });
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
            <input
              type="hidden"
              name="equipment_id"
              value={item.equipment_id}
              readOnly
            />

            <div style={{ marginBottom: "20px" }}>
              <FormLabel>Unit ID</FormLabel>
              <input
                type="text"
                value={item.unit_id || "Will be generated on save"}
                readOnly
                disabled
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                }}
              />
            </div>

            <FormLabel id="condition-radio-buttons-group-label">Condition</FormLabel>
            <RadioGroup
              aria-labelledby="condition-radio-buttons-group-label"
              name="condition-radio-buttons-group"
              value={item.condition}
              onChange={(ev) => setItem({ ...item, condition: ev.target.value })}
            >
              <FormControlLabel value="New" control={<Radio />} label="New" />
              <FormControlLabel value="Used" control={<Radio />} label="Used" />
              <FormControlLabel value="Damaged" control={<Radio />} label="Damaged" />
            </RadioGroup>

            <FormLabel id="borrowed-radio-buttons-group-label">Borrowed Status</FormLabel>
            <RadioGroup
              aria-labelledby="borrowed-radio-buttons-group-label"
              name="borrowed-radio-buttons-group"
              value={item.isBorrowed}
              onChange={(ev) => setItem({ ...item, isBorrowed: ev.target.value })}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>

            <button className="btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}