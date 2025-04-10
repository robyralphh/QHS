import { useState, useEffect, useRef } from "react";
import * as React from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import moment from "moment";
import Select from "react-select";

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
  const [laboratories, setLaboratories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add error state for better UX
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const selectRef = useRef(null);

  useEffect(() => {
    getEquipment();
    getLaboratories();
    getCategories();
  }, []);

  const getEquipment = () => {
    setLoading(true);
    setError(null); // Reset error state
    // Fetch equipment data
    axiosClient
      .get("/equipment")
      .then(({ data }) => {
        const equipmentData = data.data;
        // Fetch all items to calculate quantity
        axiosClient
          .get("/item") // Assuming the endpoint to fetch items is /item
          .then(({ data: itemsData }) => {
            const items = itemsData.data;
            // Calculate quantity for each equipment
            const updatedEquipment = equipmentData.map((equip) => {
              const relatedItems = items.filter((i) => i.equipment_id === equip.id);
              const availableItems = relatedItems.filter((i) => i.isBorrowed === "false");
              
              return {
                ...equip,
                quantity: availableItems.length, // Set the quantity based on available items
              };
            });
            setEquipment(updatedEquipment);
            setFilteredEquipment(updatedEquipment);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching items:", error);
            setError("Failed to load equipment items. Displaying equipment without quantities.");
            setEquipment(equipmentData);
            setFilteredEquipment(equipmentData);
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error("Error fetching equipment:", error);
        setError("Failed to load equipment. Please try again later.");
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
      const searchTerms = [
        ...selectedFilters
          .filter((filter) => filter.type === "search")
          .map((filter) => filter.value),
        query,
      ].filter(Boolean);

      const matchesQuery =
        searchTerms.length === 0 ||
        searchTerms.some((term) =>
          item.name.toLowerCase().includes(term.toLowerCase()) ||
          item.description.toLowerCase().includes(term.toLowerCase()) ||
          item.condition.toLowerCase().includes(term.toLowerCase()) ||
          item.id.toString().includes(term)
        );

      const selectedLaboratories = selectedFilters.filter((filter) => filter.type === "laboratory");
      const matchesLaboratory =
        selectedLaboratories.length === 0 ||
        selectedLaboratories.some((lab) => lab.value === item.laboratory_id);

      const selectedCategories = selectedFilters.filter((filter) => filter.type === "category");
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

  const handleInputChange = (inputValue) => {
    setQuery(inputValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && query.trim()) {
      event.preventDefault();
      const newSearchTag = {
        value: query.trim(),
        label: `Search: ${query.trim()}`,
        type: "search",
      };
      const updatedFilters = [...selectedFilters, newSearchTag];
      setSelectedFilters(updatedFilters);
      setQuery("");
      if (selectRef.current) {
        selectRef.current.focus();
      }
    }
  };

  const handleSelectionChange = (selectedOptions) => {
    setSelectedFilters(selectedOptions || []);
  };

  const groupedOptions = [
    {
      label: "Laboratories",
      options: laboratories.map((lab) => ({
        value: lab.id,
        label: lab.name,
        type: "laboratory",
      })),
    },
    {
      label: "Categories",
      options: categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        type: "category",
      })),
    },
  ];

  const getCategoryOptions = (itemCategories) => {
    if (!itemCategories || itemCategories.length === 0) return [];
    return itemCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      type: "category",
    }));
  };

  const getQuantityColor = (quantity) => {
    if (quantity < 2) return "red";
    if (quantity >= 3 && quantity <= 6) return "orange";
    if (quantity > 7) return "green";
    return "inherit";
  };

  return (
    <div>
      <Paper
        sx={{
          backgroundColor: 'white',
          padding: { xs: 1, sm: 2 },
          zIndex: 1200,
          position: 'relative',
        }}
      >
        <Grid container spacing={2} alignItems="center">
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

          <Grid item xs={12} sm={4} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Select
                ref={selectRef}
                isMulti
                options={groupedOptions}
                value={selectedFilters}
                onChange={handleSelectionChange}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                inputValue={query}
                placeholder="Search or filter by laboratory/category..."
                styles={{
                  container: (base) => ({
                    ...base,
                    width: isSmallScreen ? '100%' : '400px',
                    zIndex: 1300,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 1300,
                  }),
                  control: (base, state) => ({
                    ...base,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: state.isFocused ? '0 0 5px rgba(128, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    borderColor: state.isFocused ? 'maroon' : '#ccc',
                    fontSize: isSmallScreen ? '0.9rem' : '1rem',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    backgroundColor: '#fff',
                    '&:hover': {
                      borderColor: state.isFocused ? 'maroon' : '#ccc',
                    },
                  }),
                  multiValue: (base, state) => ({
                    ...base,
                    backgroundColor:
                      state.data.type === "search"
                        ? "#f0f0f0"
                        : state.data.type === "laboratory"
                        ? "#e0f7fa"
                        : "#ffebee",
                  }),
                  multiValueLabel: (base, state) => ({
                    ...base,
                    color:
                      state.data.type === "search"
                        ? "#333"
                        : state.data.type === "laboratory"
                        ? "#00796b"
                        : "#c62828",
                  }),
                }}
              />
            </Box>
          </Grid>

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

      {error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {viewMode === "table" ? (
        // Table View
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            maxHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(93vh - 200px)' },
            overflowX: 'auto',
          }}
        >
          <Table aria-label="sticky table" stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { color: "White", backgroundColor: "maroon", position: 'sticky', top: 0, zIndex: 1 } }}>
                <TableCell sx={{ minWidth: 50 }}>ID</TableCell>
                <TableCell sx={{ minWidth: 70 }}>Image</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Name</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Condition</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Quantity</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Description</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Laboratory</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Categories</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
                    <TableCell sx={{ color: getQuantityColor(item.quantity || 0) }}>
                      {item.quantity || 0}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{getLaboratoryName(item.laboratory_id)}</TableCell>
                    <TableCell>
                      {(!item.categories || item.categories.length === 0) ? (
                        "No Categories"
                      ) : (
                        <Select
                          isMulti
                          isDisabled={true}
                          options={categories.map((cat) => ({
                            value: cat.id,
                            label: cat.name,
                            type: "category",
                          }))}
                          value={getCategoryOptions(item.categories)}
                          styles={{
                            control: (base) => ({
                              ...base,
                              border: 'none',
                              boxShadow: 'none',
                              backgroundColor: 'transparent',
                              minHeight: 'auto',
                              fontSize: isSmallScreen ? '0.9rem' : '1rem',
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
                    </TableCell>
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: getQuantityColor(item.quantity || 0),
                    }}
                  >
                    <strong>Quantity:</strong> {item.quantity || 0}
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