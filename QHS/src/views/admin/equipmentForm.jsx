import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    id: null,
    name: "",
    condition: "",
    description: "",
    image: null,
    laboratory_id: "", // Add laboratory_id to the state
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [laboratories, setLaboratories] = useState([]); // Initialize as an empty array

  // Fetch equipment data
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/equipment/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setEquipment(data);
          setPreviewImage(
            data.image
              ? `http://192.168.254.219:8000/storage/` + data.image
              : null
          );
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Fetch available laboratories
  useEffect(() => {
    getLaboratory();
  }, []);

  const getLaboratory = () => {
    setLoading(true);
    axiosClient
      .get("/laboratories")
      .then(({ data }) => {
        setLoading(false);
        // Ensure data.data is an array before setting the state
        if (Array.isArray(data.data)) {
          setLaboratories(data.data);
        } else {
          console.error("Expected an array of laboratories, but got:", data.data);
          setLaboratories([]); // Set to empty array if data.data is not an array
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleImageSelection = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const formData = new FormData();

    formData.append("name", equipment.name);
    formData.append("condition", equipment.condition);
    formData.append("description", equipment.description);
    formData.append("laboratory_id", equipment.laboratory_id); // Append laboratory_id

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      if (equipment.id) {
        // Use PUT for updates
        await axiosClient.post(`/equipment/${equipment.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Use POST for creating new equipment
        await axiosClient.post("/equipment", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      navigate("../equipment");
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
      } else {
        console.error("Server Error:", response?.data || err.message);
        setErrors({ general: ["An unexpected error occurred. Please try again."] });
      }
    }
  };

  return (
    <>
      {/* Back Button */}
      <Link to="../equipment">
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
      {equipment.id && <h1>Update Equipment: {equipment.name}</h1>}
      {!equipment.id && <h1>New Equipment</h1>}

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
            {/* Name Field */}
            <input
              value={equipment.name}
              onChange={(ev) =>
                setEquipment({ ...equipment, name: ev.target.value })
              }
              placeholder="Name"
            />

            {/* Condition Field as Radio Buttons */}
            <FormLabel id="condition-radio-buttons-group-label">Condition</FormLabel>
            <RadioGroup
              aria-labelledby="condition-radio-buttons-group-label"
              name="condition-radio-buttons-group"
              value={equipment.condition}
              onChange={(ev) =>
                setEquipment({ ...equipment, condition: ev.target.value })
              }
            >
              <FormControlLabel value="New" control={<Radio />} label="New" />
              <FormControlLabel value="Used" control={<Radio />} label="Used" />
              <FormControlLabel value="Damaged" control={<Radio />} label="Damaged" />
            </RadioGroup>

            {/* Description Field */}
            <input
              value={equipment.description}
              onChange={(ev) =>
                setEquipment({ ...equipment, description: ev.target.value })
              }
              placeholder="Description"
            />

            {/* Laboratory Select Field */}
            <FormControl fullWidth>
              <InputLabel id="laboratory-label">Laboratory</InputLabel>
              <Select
                labelId="laboratory-label"
                value={equipment.laboratory_id}
                onChange={(ev) =>
                  setEquipment({ ...equipment, laboratory_id: ev.target.value })
                }
                label="Laboratory"
              >
                {laboratories.map((laboratory) => (
                  <MenuItem key={laboratory.id} value={laboratory.id}>
                    {laboratory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Image Upload */}
            <div>
              <h3>Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelection}
              />
              {(previewImage || equipment.image) && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={previewImage || `http://192.168.254.219:8000/storage/${equipment.image}`}
                    alt="Preview"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            {/* Save Button */}
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  );
}