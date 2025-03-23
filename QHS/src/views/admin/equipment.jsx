import { useState, useEffect } from "react";
import * as React from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import moment from "moment";
import Select from "react-select"; // Import react-select for multi-select

// UI Components
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import IconButton from '@mui/material/IconButton';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ArchiveIcon from '@mui/icons-material/Archive';
import { Box, Grid, Card, CardMedia, CardContent, CardActions, ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme } from "@mui/material";
import { Avatar, Typography } from "@mui/material";
import { getInitials } from "../../utils";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [laboratories, setLaboratories] = useState([]); // State for laboratories
  const [categories, setCategories] = useState([]); // State for categories
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedLaboratories, setSelectedLaboratories] = useState([]); // State for selected laboratories
  const [selectedCategories, setSelectedCategories] = useState([]); // State for selected categories
  const [viewMode, setViewMode] = useState("table"); // State for view mode (table or card)

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

  useEffect(() => {
    getEquipment();
    getLaboratories();
    getCategories(); // Fetch categories
  }, []);

  const getEquipment = () => {
    setLoading(true);
    axiosClient
      .get("/equipment")
      .then(({ data }) => {
        setLoading(false);
        setEquipment(data.data);
        setFilteredEquipment(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

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

  const getLaboratoryName = (laboratoryId) => {
    const laboratory = laboratories.find((lab) => lab.id === laboratoryId);
    return laboratory ? laboratory.name : "Unknown Laboratory";
  };

  const getCategoryNames = (categories) => {
    if (!categories || categories.length === 0) return "No Categories";
    return categories.map((cat) => cat.name).join(", ");
  };

  const onDeleteClick = (item) => {
    axiosClient.delete(`equipment/${item.id}`).then(() => {
      getEquipment();
      handleClose();
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = (item) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
  };

  const toggleActiveStatus = (item) => {
    const updatedStatus = !item.isActive;
    axiosClient
      .put(`equipment/${item.id}`, { isActive: updatedStatus })
      .then(() => {
        const updatedEquipment = equipment.map((e) =>
          e.id === item.id ? { ...e, isActive: updatedStatus } : e
        );
        setEquipment(updatedEquipment);
        setFilteredEquipment(updatedEquipment);
      })
      .catch((error) => {
        console.error("Error toggling status:", error.response ? error.response.data : error);
      });
  };

  const searchData = (data) => {
    return data.filter((item) => {
      // Filter by name, description, condition, or ID
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.condition.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toString().includes(query);

      // Filter by selected laboratories
      const matchesLaboratory =
        selectedLaboratories.length === 0 ||
        selectedLaboratories.some((lab) => lab.value === item.laboratory_id);

      // Filter by selected categories
      const matchesCategory =
        selectedCategories.length === 0 ||
        (item.categories &&
          item.categories.some((cat) =>
            selectedCategories.some((selected) => selected.value === cat.id)
          ));

      return matchesQuery && matchesLaboratory && matchesCategory;
    });
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <div>
      {/* First Section (Search Bar) - Using Grid with Flex */}
      <Paper
        sx={{
          backgroundColor: 'white',
          padding: { xs: 1, sm: 2 },
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Title and Description */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2.5vh' },
                color: 'Maroon',
                overflowWrap: "break-word",
              }}
            >
              List of Equipment
            </Typography>
            <Typography
              sx={{
                color: 'gray',
                overflowWrap: "break-word",
                fontSize: { xs: '0.8rem', sm: '1rem' },
              }}
            >
              A list of all equipment. Here you can manage equipment details, conditions, and more.
            </Typography>
          </Grid>

          {/* Search Bar and Filters */}
          <Grid item xs={12} sm={4} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on extra-small screens
                gap: { xs: 1, sm: 2 },
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Search Equipment..."
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: { xs: '100%', sm: '200px' }, // Full width on extra-small screens
                  padding: { xs: '6px', sm: '8px' },
                  boxSizing: 'border-box',
                }}
              />
              <Select
                isMulti
                options={laboratories.map((lab) => ({
                  value: lab.id,
                  label: lab.name,
                }))}
                value={selectedLaboratories}
                onChange={setSelectedLaboratories}
                placeholder="Filter by Laboratory"
                styles={{
                  container: (base) => ({
                    ...base,
                    width: isSmallScreen ? '100%' : '200px', // Full width on small screens
                  }),
                }}
              />
              <Select
                isMulti
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                value={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Filter by Category"
                styles={{
                  container: (base) => ({
                    ...base,
                    width: isSmallScreen ? '100%' : '200px', // Full width on small screens
                  }),
                }}
              />
            </Box>
          </Grid>

          {/* Add New Equipment Button */}
          <Grid item xs={12} sm={4} md={3} sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
            <Link to="new/">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "white",
                  color: "maroon",
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  padding: { xs: '6px 12px', sm: '8px 16px' },
                }}
              >
                Add New Equipment
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Paper>

      {/* No Spacer Needed Since Header is Not Fixed */}
      <Box sx={{ pt: 1, pb: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
        >
          <ToggleButton value="table" aria-label="List View">
            <FormatListBulletedIcon />
          </ToggleButton>
          <ToggleButton value="card" aria-label="Grid View">
            <GridViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === "table" ? (
        // Table View
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            maxHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(93vh - 200px)' },
            overflowX: 'auto', // Enable horizontal scrolling on small screens
          }}
        >
          <Table aria-label="sticky table" stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { color: "White", backgroundColor: "maroon", position: 'sticky', top: 0, zIndex: 1 } }}>
                <TableCell sx={{ minWidth: 50 }}>ID</TableCell>
                <TableCell sx={{ minWidth: 70 }}>Image</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Name</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Condition</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Description</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Laboratory</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Categories</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Fetching Data ...
                  </TableCell>
                </TableRow>
              ) : (
                searchData(filteredEquipment).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item) => (
                  <TableRow
                    component={Link}
                    to={`info/${item.id}`}
                    key={item.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      },
                      textDecoration: 'none',
                    }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <img
                        src={'http://192.168.254.219:8000/storage/' + item.image}
                        width={isSmallScreen ? '40' : '50'}
                        alt={item.name}
                      />
                    </TableCell>
                    <TableCell>{item.name.toUpperCase()}</TableCell>
                    <TableCell>{item.condition}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{getLaboratoryName(item.laboratory_id)}</TableCell>
                    <TableCell>{getCategoryNames(item.categories)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: { xs: 0.2, sm: 0.5 } }}>
                        <Link to={'' + item.id}>
                          <IconButton color="primary" aria-label="Edit" size={isSmallScreen ? "small" : "large"}>
                            <EditIcon />
                          </IconButton>
                        </Link>
                        <IconButton
                          color={item.isActive ? "success" : "error"}
                          aria-label="Toggle Status"
                          size={isSmallScreen ? "small" : "large"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleActiveStatus(item);
                          }}
                        >
                          <ArchiveIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label="Delete"
                          size={isSmallScreen ? "small" : "large"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleClickOpen(item);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Card View
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ p: { xs: 1, sm: 2 } }}>
          {searchData(filteredEquipment).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
              <Card component={Link} style={{ textDecoration: 'none' }} to={`info/${item.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height={isSmallScreen ? "120" : "140"}
                  image={'http://192.168.254.219:8000/storage/' + item.image}
                  alt={item.name}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {item.name.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>ID:</strong> {item.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Condition:</strong> {item.condition}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Description:</strong> {item.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Laboratory:</strong> {getLaboratoryName(item.laboratory_id)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Categories:</strong> {getCategoryNames(item.categories)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', padding: { xs: '4px', sm: '8px' } }}>
                  <IconButton
                    color="primary"
                    aria-label="Edit"
                    component={Link}
                    to={'' + item.id}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color={item.isActive ? "success" : "error"}
                    aria-label="Toggle Status"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleActiveStatus(item);
                    }}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    <ArchiveIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClickOpen(item);
                    }}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Table Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1, sm: 2 } }}>
        <TablePagination
          component="div"
          count={filteredEquipment.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        />
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title" color="error">
          Delete Equipment: {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the equipment "{selectedItem?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={() => onDeleteClick(selectedItem)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}