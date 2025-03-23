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
  Select as MuiSelect,
  MenuItem,
} from "@mui/material";
import Select from "react-select"; // Import react-select

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    id: null,
    name: "",
    condition: "",
    description: "",
    image: null,
    laboratory_id: "",
    category_ids: [], // Changed from 'categories' to 'category_ids' to match backend
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [laboratories, setLaboratories] = useState([]);
  const [categories, setCategories] = useState([]); // State for all categories
  const [selectedCategories, setSelectedCategories] = useState([]); // State for selected categories

  // Fetch equipment data
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/equipment/${id}`)
        .then(({ data }) => {
          setLoading(false);
          const equipmentData = data.data;

          setEquipment({
            id: equipmentData.id,
            name: equipmentData.name,
            condition: equipmentData.condition,
            description: equipmentData.description,
            image: equipmentData.image,
            laboratory_id: equipmentData.laboratory_id,
            category_ids: equipmentData.categories
              ? equipmentData.categories.map((cat) => cat.id)
              : [], // Extract category IDs
          });

          // Set selected categories for react-select
          if (equipmentData.categories) {
            const selected = equipmentData.categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }));
            setSelectedCategories(selected);
          }

          setPreviewImage(
            equipmentData.image
              ? `http://192.168.254.219:8000/storage/${equipmentData.image}`
              : null
          );
        })
        .catch((err) => {
          setLoading(false);
          console.error("Error fetching equipment data:", err);
        });
    }
  }, [id]);

  // Fetch available laboratories and categories
  useEffect(() => {
    getLaboratory();
    getCategories();
  }, []);

  const getLaboratory = () => {
    setLoading(true);
    axiosClient
      .get("/laboratories")
      .then(({ data }) => {
        setLoading(false);
        if (Array.isArray(data.data)) {
          setLaboratories(data.data);
        } else {
          console.error("Expected an array of laboratories, but got:", data.data);
          setLaboratories([]);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getCategories = () => {
    axiosClient
      .get("/categories")
      .then(({ data }) => {
        setCategories(data.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };

  const handleImageSelection = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
    // Update equipment state with selected category IDs
    const categoryIds = selectedOptions.map((option) => option.value);
    setEquipment((prev) => ({
      ...prev,
      category_ids: categoryIds, // Store as array of IDs
    }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const formData = new FormData();

    formData.append("name", equipment.name);
    formData.append("condition", equipment.condition);
    formData.append("description", equipment.description);
    formData.append("laboratory_id", equipment.laboratory_id);

    // Append each category ID individually to FormData
    if (equipment.category_ids && equipment.category_ids.length > 0) {
      equipment.category_ids.forEach((id) => {
        formData.append("category_ids[]", id); // Use array notation for multiple values
      });
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    if (!equipment.id) {
      formData.append("_method", "POST");
    } else {
      formData.append("_method", "PUT");
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
      {equipment.id ? <h1>Update Equipment: {equipment.name}</h1> : <h1>New Equipment</h1>}

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
              <MuiSelect
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
              </MuiSelect>
            </FormControl>

            {/* Categories Multi-Select Field */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Select
                isMulti
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                value={selectedCategories}
                onChange={handleCategoryChange}
                placeholder="Select categories"
              />
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