import { useState, useEffect } from "react";
import * as React from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import moment from "moment";

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

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [laboratories, setLaboratories] = useState([]); // State for laboratories
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // State for view mode (table or card)

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    getEquipment();
    getLaboratories(); // Fetch laboratories
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
      .get("/laboratories") // Adjust the API endpoint
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
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.condition.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toString().includes(query)
    );
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <div>
      {/* First Table */}
      <TableContainer component={Paper} >
        <Table sx={{backgroundColor:'white'}}>
          <TableHead >
            <TableRow >
              <TableCell sx={{ maxWidth: '250px' }}>
                <Typography variant="h9" sx={{ fontSize: '2.5vh', color: 'Maroon', overflowWrap: "break-word" }}>
                  List of Equipment
                </Typography>
                <Typography sx={{ color: 'gray', overflowWrap: "break-word" }}>
                  A list of all equipment. Here you can manage equipment details, conditions, and more.
                </Typography>
              </TableCell>
              <TableCell align="center">
                <input
                  type="text"
                  placeholder="Search Equipment..."
                  onChange={(e) => setQuery(e.target.value)}
                  elevation={6}
                />
              </TableCell>
              <TableCell align="right">
                <Link to="new/">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ backgroundColor: "white", color: "maroon" }}
                  >
                    Add New Equipment
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

    
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
        <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 'calc(93vh - 200px)' }}>
          <Table aria-label="sticky table" stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { color: "White", backgroundColor: "maroon", position: 'sticky', top: 0, zIndex: 1 } }}>
                <TableCell>ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Laboratory</TableCell>
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
              ) : (
                searchData(filteredEquipment).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item) => (
                  <TableRow
                    component={Link}
                    to={`item/${item.id}`}
                    key={item.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      },

                      textDecoration:'none',
                    }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <img
                        src={'http://192.168.254.219:8000/storage/' + item.image}
                        width={'50'}
                        alt={item.name}
                      />
                    </TableCell>
                    <TableCell>{item.name.toUpperCase()}</TableCell>
                    <TableCell>{item.condition}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{getLaboratoryName(item.laboratory_id)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: .5 }}>
                        <Link to={'' + item.id}>
                          <IconButton color="primary" aria-label="Edit" size="large">
                            <EditIcon />
                          </IconButton>
                        </Link>
                        <IconButton
                          color={item.isActive ? "success" : "error"}
                          aria-label="Toggle Status"
                          size="large"
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
                          size="large"
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
        <Grid container spacing={2} sx={{ p: 2 }}>
          {searchData(filteredEquipment).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
              <Card component={Link} style={{ textDecoration: 'none' }} to={`item/${item.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={'http://192.168.254.219:8000/storage/' + item.image}
                  alt={item.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ID:</strong> {item.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Condition:</strong> {item.condition}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {item.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Laboratory:</strong> {getLaboratoryName(item.laboratory_id)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton
                    color="primary"
                    aria-label="Edit"
                    component={Link}
                    to={'' + item.id}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <TablePagination
          component="div"
          count={filteredEquipment.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
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