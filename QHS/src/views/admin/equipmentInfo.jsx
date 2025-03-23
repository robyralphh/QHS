import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, CircularProgress } from "@mui/material";
import IconButton from '@mui/material/IconButton';

export default function EquipmentInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [laboratories, setLaboratories] = useState([]);
  const [item, setItem] = useState([]);
  const [equipment, setEquipment] = useState({
    id: null,
    name: "",
    location: "",
    description: "",
    image: "",
    laboratory_id: null,
    quantity: null,
  });

  // Fetch equipment details
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/equipment/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setEquipment(data.data); // Set equipment data
        })
        .catch((err) => {
          setLoading(false);
          setError("Failed to fetch equipment details.");
          console.error(err);
        });
    }
  }, [id]);

  // Fetch laboratories
  useEffect(() => {
    getLaboratories();
  }, []);

  // Fetch items when equipment.id changes
  useEffect(() => {
    if (equipment.id) {
      getItem();
    }
  }, [equipment.id]); // Add equipment.id as a dependency

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

  const getItem = () => {
    axiosClient
      .get("/item")
      .then(({ data }) => {
        // Filter items by equipment_id
        const filteredItems = data.data.filter((i) => i.equipment_id === equipment.id);
        setItem(filteredItems); // Set filtered items

        // Count only available items (where isBorrowed is "false")
        const availableItems = filteredItems.filter((i) => i.isBorrowed === "false");
        setEquipment((prev) => ({
          ...prev,
          quantity: availableItems.length,
        }));
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });
  };

  const getLaboratoryName = (laboratoryId) => {
    const laboratory = laboratories.find((lab) => lab.id === laboratoryId);
    return laboratory ? laboratory.name : "Unknown Laboratory";
  };

  // Function to determine the background color based on status
  const getStatusColor = (isBorrowed, condition) => {
    if (condition === "broken") {
      return "rgba(255, 0, 0, 0.6)"; // Red with 30% opacity
    } else if (isBorrowed === "true") {
      return "rgba(255, 165, 0, 0.6)"; // Orange with 30% opacity
    } else {
      return "rgba(0, 128, 0, 0.6)"; // Green with 30% opacity
    }
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

      <Box sx={{ mb: 2, mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: 'maroon', color: 'white', "&:hover": { backgroundColor: 'darkred' } }}
          onClick={() => navigate(`/admin/equipment/info/${id}/add-item`)} // Use path instead of query parameter
        >
          Add Unit
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 'calc(93vh - 200px)' }}>
        <Table aria-label="sticky table" stickyHeader>
          <TableHead>
            <TableRow sx={{ "& th": { color: "White", backgroundColor: "maroon", position: 'sticky', top: 0, zIndex: 1 } }}>
              <TableCell>ID</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Fetching Data ...
                </TableCell>
              </TableRow>
            ) : item.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              item.map((i) => (
                <TableRow
                  component={Link}
                  to={`info/${i.id}`}
                  key={i.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      cursor: 'pointer',
                    },
                    textDecoration: 'none',
                  }}
                >
                  <TableCell>{i.id}</TableCell>
                  <TableCell>{i.condition}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: getStatusColor(i.isBorrowed, i.condition),
                        borderRadius: '20px', // Oval shape
                        padding: '4px 12px', // Add padding
                        display: 'inline-block', // Wrap tightly around text
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'white', // White text for contrast
                          fontWeight: 'bold',
                        }}
                      >
                        {i.isBorrowed === "true" ? "Currently Borrowed" : "Available"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(i.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Link to={`edit-item/${i.id}`}>
                        <IconButton color="primary" aria-label="Edit" size="large">
                          <EditIcon />
                        </IconButton>
                      </Link>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}