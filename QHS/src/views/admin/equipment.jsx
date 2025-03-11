import { useState, useEffect } from "react";
import * as React from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import moment from "moment";
// UI
import { styled } from "@mui/material/styles";
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ArchiveIcon from '@mui/icons-material/Archive';
import { Box } from "@mui/material";
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

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 8)];
    }
    return color;
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableRow>
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
                elevation={6} />
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
        </Table>
      </TableContainer>

      {/* Table with sticky header */}
      <TableContainer component={Paper} elevation={3} 
      sx={{ 
        maxHeight: 'calc(93vh - 200px)',
       }}>
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
          {loading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Fetching Data ...
                </TableCell>
              </TableRow>
            </TableBody>
          )}
          {!loading && (
            <TableBody>
              {searchData(filteredEquipment).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <image
                      src={'http://192.168.254.219:8000/storage/' + item.image || undefined}
                      sx={{
                        width: 44,
                        height: 44,
                        fontSize: 14,
                        m: 'auto',
                        backgroundColor: item.image ? 'transparent' : getRandomColor(),
                        color: item.image ? 'inherit' : 'white'
                      }}
                    >
                      {!item.image && getInitials(item.name)}
                    </image>
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
                        onClick={() => toggleActiveStatus(item)}
                      >
                        <ArchiveIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        aria-label="Delete"
                        size="large"
                        onClick={() => handleClickOpen(item)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        
      </TableContainer>
      <TablePagination
          component="div"
          count={filteredEquipment.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" color="error">
          EQUIPMENT DELETION
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this equipment?
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