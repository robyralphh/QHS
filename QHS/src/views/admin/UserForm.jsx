import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosClient from "../../axiosClient";

import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
  Button,
  Avatar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CameraAltIcon from "@mui/icons-material/CameraAlt"; // Import camera icon

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "",
    avatar: null,
    
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/users/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setUser(data);
          setAvatarPreview(
            data.avatar ? `http://127.0.0.1:8000/storage/` + data.avatar : null
          );
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleAvatarChange = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      setUser({ ...user, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const formData = new FormData();

    // Append user data to formData
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("role", user.role);

    if (user.password) {
      formData.append("password", user.password);
    }
    if (user.avatar instanceof File) {
      formData.append("avatar", user.avatar);
    }
    if (!user.id) {
      formData.append("isActive", true);
      formData.append("_method", "POST");
    } else {
      formData.append("_method", "PUT");
    }

    try {
      if (user.id) {
        await axiosClient.post(`users/${user.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axiosClient.post("/users", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      navigate("../users");
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
      <Link to="../users">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "maroon",
            borderColor: "maroon",
            marginBottom: 2, // Add some spacing below the button
            "&:hover": {
              borderColor: "maroon",
              backgroundColor: "rgba(128, 0, 0, 0.04)",
            },
          }}
        >
          Back
        </Button>
      </Link>
      {user.id && <h1>Update User: {user.name}</h1>}
      {!user.id && <h1>New User</h1>}
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
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Avatar with file input */}
              <IconButton
                component="label"
                sx={{
                  padding: 0,
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <Avatar
                  src={avatarPreview}
                  alt="Avatar Preview"
                  sx={{ width: 100, height: 100, marginBottom: 2 }}
                />
                {/* Camera icon overlay */}
                <CameraAltIcon 
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    color: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "50%",
                    padding: 1,
                  }}
                />
                {/* Hidden file input */}
                <input
                  type="file"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: "none" }} // Hide the file input
                />
              </IconButton>
            </div>
            <input
              value={user.name}
              onChange={(ev) => setUser({ ...user, name: ev.target.value })}
              placeholder="Name"
            />
            <input
              value={user.email}
              onChange={(ev) => setUser({ ...user, email: ev.target.value })}
              placeholder="Email"
            />
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">
                User Type:
              </FormLabel>
              <RadioGroup
                onChange={(ev) => setUser({ ...user, role: ev.target.value })}
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={user.role}
              >
                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                <FormControlLabel
                  value="custodian"
                  control={<Radio />}
                  label="Custodian"
                />
                <FormControlLabel value="user" control={<Radio />} label="User" />
              </RadioGroup>
            </FormControl>
            <input
              type="password"
              onChange={(ev) => setUser({ ...user, password: ev.target.value })}
              placeholder="Password"
            />
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  );
}