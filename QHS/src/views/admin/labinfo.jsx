import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Typography } from "@mui/material";

export default function LabInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laboratory, setLaboratory] = useState({
    id: null,
    name: "",
    location: "",
    description: "",
    custodianID: null, 
  });

  const [loading, setLoading] = useState(false);
  const [custodians, setCustodians] = useState([]);
  const [selectedCustodian, setSelectedCustodian] = useState('');

  // Fetch laboratory details if id is present
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/laboratories/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setLaboratory(data);
          setSelectedCustodian(data.custodianID || ''); // Set the selected custodian ID
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Fetch custodians when the component mounts
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    setLoading(true);
    axiosClient
      .get("/users", { params: { role: "custodian" } })
      .then(({ data }) => {
        setLoading(false);
        setCustodians(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onSubmit = (ev) => {
    ev.preventDefault();

    // If "Remove" is selected, set custodianID to null
    const payload = {
      ...laboratory,
      custodianID: selectedCustodian === 0 ? null : selectedCustodian,
    };
    delete payload.gallery;
    
    if (laboratory.id) {
      axiosClient
        .put(`/laboratories/${laboratory.id}`, payload)
        .then(() => {
          navigate("../lab");
        })
        .catch((err) => {
          const response = err.response;
          console.error("Error Response:", response); // Log the error response
          if (response && response.status === 422) {
            if (response.data.message) {
              // Display the error message to the user
              alert(response.data.message);
            } else {
              setErrors(response.data.errors);
            }
          }
        });
    } else {
      navigate("../lab");
    }
  };

  const handleCustodianChange = (event) => {
    setSelectedCustodian(event.target.value);
  };

  return (
    <>
      {/* Back Button */}
      <Link to="../lab">
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
      {laboratory.id && <Typography variant="h4" sx={{ color:"maroon"}}>{laboratory.name}</Typography>}
      <Typography variant="body" sx={{ color:"gray"}}>{laboratory.description}</Typography>
      <div className="card animated fadeInDown">
        {!loading && (
          <form onSubmit={onSubmit}>
            <FormControl fullWidth>
              <InputLabel id="custodian-select-label">Select Custodian</InputLabel>
              <Select
                labelId="custodian-select-label"
                id="custodian-select"
                value={selectedCustodian}
                label="Select Custodian"
                onChange={handleCustodianChange}
              >
                <MenuItem value={0}>--None--</MenuItem>
                {custodians.map((custodian) => (
                  <MenuItem key={custodian.id} value={custodian.id}>
                    {custodian.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
            <button className="btn" sx={{borderRadius:"20%"}}>SET</button>
          </form>
        )}
      </div>
    </>
  );
}