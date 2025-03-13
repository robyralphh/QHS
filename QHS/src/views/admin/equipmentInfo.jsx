import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, CircularProgress } from "@mui/material";

export default function EquipmentInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [laboratories, setLaboratories] = useState([]);
  const [equipment, setEquipment] = useState({
    id: null,
    name: "",
    location: "",
    description: "",
    image: "",
    laboratory_id: null,
    quantity: null,
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/equipment/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setEquipment(data.data);
        })
        .catch((err) => {
          setLoading(false);
          setError("Failed to fetch equipment details.");
          console.error(err);
        });
    }
  }, [id]);

  useEffect(() => {
    getLaboratories();
  }, []);

  const getLaboratories = () => {
    axiosClient
      .get("/laboratories")
      .then(({ data }) => {
        setLaboratories(data.data);
      })
      .catch((error) => {
        console.error("Error fetching laboratories:", error);
      });
  };

  const getLaboratoryName = (laboratoryId) => {
    const laboratory = laboratories.find((lab) => lab.id === laboratoryId);
    return laboratory ? laboratory.name : "Unknown Laboratory";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        component={Link}
        to="../equipment"
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

      <Card>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <CardMedia
                component="img"
                image={equipment.image ? `http://192.168.254.219:8000/storage/${equipment.image}` : 'path/to/fallback/image'}
                alt={equipment.name}
                sx={{ borderRadius: '8px', height: 'auto', maxHeight: 300 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                {equipment.name.toUpperCase()}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                Laboratory: {getLaboratoryName(equipment.laboratory_id)}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                Quantity: {equipment.quantity}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Description: {equipment.description}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: 'maroon', color: 'white', "&:hover": { backgroundColor: 'darkred' } }}
          onClick={() => navigate(`add-item`)}
        >
          Add Item
        </Button>
      </Box>
    </Container>
  );
}