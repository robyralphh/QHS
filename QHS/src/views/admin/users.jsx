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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    setLoading(true);
    axiosClient
      .get("/users")
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data);
        setFilteredUsers(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onDeleteClick = (user) => {
    axiosClient.delete(`users/${user.id}`).then(() => {
      getUsers();
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

  const handleClickOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const toggleActiveStatus = (user) => {
    const updatedStatus = !user.isActive;
    axiosClient
      .put(`users/${user.id}`, { isActive: updatedStatus })
      .then(() => {
        const updatedUsers = users.map((u) =>
          u.id === user.id ? { ...u, isActive: updatedStatus } : u
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
      })
      .catch((error) => {
        console.error("Error toggling status:", error.response ? error.response.data : error);
      });
  };

  const searchData = (data) => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase()) ||
        item.role.toLowerCase().includes(query.toLowerCase()) ||
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
                List of Users
              </Typography>
              <Typography sx={{ color: 'gray', overflowWrap: "break-word" }}>
                A list of all registered user accounts. Here you can create, edit, and
                remove users, as well as manage their roles and statuses.
              </Typography>
            </TableCell>
            <TableCell align="center">
              <input
                type="text"
                placeholder="Search Users..."
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
                  Add new User
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
              <TableCell>Avatar</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>E-MAIL</TableCell>
              <TableCell>USER TYPE</TableCell>
              <TableCell>CREATED</TableCell>
              <TableCell>UPDATED AT</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          {loading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Fetching Data ...
                </TableCell>
              </TableRow>
            </TableBody>
          )}
          {!loading && (
            <TableBody>
              {searchData(filteredUsers).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>
                    <Avatar
                      src={'http://192.168.254.219:8000/storage/' + u.avatar || undefined}
                      sx={{
                        width: 44,
                        height: 44,
                        fontSize: 14,
                        m: 'auto',
                        backgroundColor: u.avatar ? 'transparent' : getRandomColor(),
                        color: u.avatar ? 'inherit' : 'white'
                      }}
                    >
                      {!u.avatar && getInitials(u.name)}
                    </Avatar>
                  </TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{moment(u.created_at).format("MM/DD/yyyy HH:mm:ss")}</TableCell>
                  <TableCell>{moment(u.updated_at).format("MM/DD/yyyy HH:mm:ss")}</TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
                    ) : (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: .5 }}>
                      <Link to={'' + u.id}>
                        <IconButton color="primary" aria-label="Edit" size="large">
                          <EditIcon />
                        </IconButton>
                      </Link>
                      <IconButton
                        color={u.isActive ? "success" : "error"}
                        aria-label="Toggle Status"
                        size="large"
                        onClick={() => toggleActiveStatus(u)}
                      >
                        <ArchiveIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        aria-label="Delete"
                        size="large"
                        onClick={() => handleClickOpen(u)}
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
          count={filteredUsers.length}
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
          USER DELETION
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={() => onDeleteClick(selectedUser)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}