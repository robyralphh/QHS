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
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import Select from "react-select";

export default function EquipmentInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [laboratories, setLaboratories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [item, setItem] = useState([]);
  const [equipment, setEquipment] = useState({
    id: null,
    name: "",
    location: "",
    description: "",
    image: "",
    laboratory_id: null,
    quantity: null,
    categories: [],
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/equipment/${id}`)
        .then(({ data }) => {
          console.log("Equipment data:", data);
          setLoading(false);
          setEquipment(data.data);
          setSelectedCategories(
            data.data.categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
              type: "category",
            }))
          );
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
    getCategories();
  }, []);

  useEffect(() => {
    if (equipment.id) {
      getItem();
    }
  }, [equipment.id]);

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

  const getItem = () => {
    axiosClient
      .get("/item")
      .then(({ data }) => {
        const filteredItems = data.data.filter((i) => i.equipment_id === equipment.id);
        setItem(filteredItems);
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

  const getCategoryNames = (categories) => {
    if (!categories || categories.length === 0) return "No Categories";
    return categories.map((cat) => cat.name).join(", ");
  };

  const getCategoryOptions = (itemCategories) => {
    if (!itemCategories || itemCategories.length === 0) return [];
    return itemCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      type: "category",
    }));
  };

  const getStatusColor = (isBorrowed, condition) => {
    if (condition === "broken") {
      return "rgba(255, 0, 0, 0.6)";
    } else if (isBorrowed === "true") {
      return "rgba(255, 165, 0, 0.6)";
    } else {
      return "rgba(0, 128, 0, 0.6)";
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategories(
      equipment.categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        type: "category",
      }))
    );
  };

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions || []);
  };

  const handleSaveCategories = () => {
    const categoryIds = selectedCategories.map((cat) => cat.value);
    const payload = {
      ...equipment,
      category_ids: categoryIds,
    };
    console.log("Payload being sent:", payload);
    axiosClient
      .put(`/equipment/${id}`, payload)
      .then((response) => {
        console.log("Response from server:", response.data);
        axiosClient.get(`/equipment/${id}`).then(({ data }) => {
          setEquipment(data.data);
          setOpenModal(false);
        });
      })
      .catch((error) => {
        const errorMessage = error.response
          ? `Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
          : error.message;
        console.error("Error updating categories:", errorMessage);
        setError(errorMessage);
      });
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
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                Description: {equipment.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  Categories:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {(!equipment.categories || equipment.categories.length === 0) ? (
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      No Categories
                    </Typography>
                  ) : (
                    <Select
                      isMulti
                      isDisabled={true}
                      options={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                        type: "category",
                      }))}
                      value={getCategoryOptions(equipment.categories)}
                      styles={{
                        control: (base) => ({
                          ...base,
                          border: 'none',
                          boxShadow: 'none',
                          backgroundColor: 'transparent',
                          minHeight: 'auto',
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#ffebee',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: '#c62828',
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          display: 'none',
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          display: 'none',
                        }),
                      }}
                    />
                  )}
                  <IconButton color="primary" onClick={handleOpenModal} sx={{ p: 0 }}>
                    <EditIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Edit Categories for {equipment.name}</DialogTitle>
        <DialogContent sx={{ overflow: 'visible' }}>
          <Select
            isMulti
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
              type: "category",
            }))}
            value={selectedCategories}
            onChange={handleCategoryChange}
            placeholder="Select categories..."
            styles={{
              control: (base) => ({
                ...base,
                marginTop: '8px',
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#ffebee',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#c62828',
              }),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveCategories} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 2, mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: 'maroon', color: 'white', "&:hover": { backgroundColor: 'darkred' } }}
          onClick={() => navigate(`/admin/equipment/info/${id}/add-item`)}
        >
          Add Unit
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 'calc(93vh - 200px)', overflow:'auto' }}>
        <Table aria-label="sticky table" stickyHeader>
          <TableHead>
            <TableRow sx={{ "& th": { color: "White", backgroundColor: "maroon", position: 'sticky', top: 0, zIndex: 1 } }}>
              <TableCell>Unit ID</TableCell> {/* Changed from ID to Unit ID */}
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
                  to={`info/${i.id}`} // Still using i.id for navigation
                  key={i.id} // Still using i.id as the key
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      cursor: 'pointer',
                    },
                    textDecoration: 'none',
                  }}
                >
                  <TableCell>{i.unit_id || "N/A"}</TableCell> {/* Changed from i.id to i.unit_id */}
                  <TableCell>{i.condition}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: getStatusColor(i.isBorrowed, i.condition),
                        borderRadius: '20px',
                        padding: '4px 12px',
                        display: 'inline-block',
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'white',
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
                      <Link to={`edit-item/${i.id}`}> {/* Still using i.id for navigation */}
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