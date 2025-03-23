import { useState, useEffect } from "react";
import * as React from "react";
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
import { 
  Box, 
  TextField, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  Snackbar, 
  Alert, 
  Avatar, 
  Typography
} from "@mui/material";
import { getInitials } from "../../utils";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState("");
  const [userForm, setUserForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
      handleCloseDeleteDialog();
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setUserForm({
        id: user.id,
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        avatar: user.avatar,
      });
      setAvatarPreview(
        user.avatar ? `http://192.168.254.219:8000/storage/${user.avatar}` : null
      );
    } else {
      setUserForm({
        id: null,
        name: "",
        email: "",
        password: "",
        role: "",
        avatar: null,
      });
      setAvatarPreview(null);
    }
    setOpenUserModal(true);
  };

  const handleCloseUserModal = () => {
    setOpenUserModal(false);
    setUserForm({
      id: null,
      name: "",
      email: "",
      password: "",
      role: "",
      avatar: null,
    });
    setAvatarPreview(null);
    setErrors(null);
  };

  const handleAvatarChange = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      setUserForm({ ...userForm, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUserFormChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserFormSubmit = async (ev) => {
    ev.preventDefault();
    const formData = new FormData();

    formData.append("name", userForm.name);
    formData.append("email", userForm.email);
    formData.append("role", userForm.role);

    if (userForm.password) {
      formData.append("password", userForm.password);
    }
    if (userForm.avatar instanceof File) {
      formData.append("avatar", userForm.avatar);
    }
    if (!userForm.id) {
      formData.append("isActive", true);
      formData.append("_method", "POST");
    } else {
      formData.append("_method", "PUT");
    }

    try {
      if (userForm.id) {
        await axiosClient.post(`users/${userForm.id}`, formData, {
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
      getUsers();
      handleCloseUserModal();
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

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ backgroundColor: "white", color: "maroon" }}
                onClick={() => handleOpenUserModal()}
              >
                Add new User
              </Button>
            </TableCell>
          </TableRow>
        </Table>
      </TableContainer>

      {/* Table with sticky header */}
      <TableContainer component={Paper} elevation={3} 
      sx={{ 
        maxHeight: 'calc(91vh - 200px)',
       }}>
        <Table aria-label="sticky table" stickyHeader>
          <TableHead>
            <TableRow sx={{ "& th": { color: "White", backgroundColor: "maroon", position: 'sticky', top: 0, zIndex: 1 } }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>ID</span>
                  <IconButton size="small" onClick={() => requestSort('id')}>
                    {sortConfig.key === 'id' && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>Avatar</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>NAME</span>
                  <IconButton size="small" onClick={() => requestSort('name')}>
                    {sortConfig.key === 'name' && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>E-MAIL</span>
                  <IconButton size="small" onClick={() => requestSort('email')}>
                    {sortConfig.key === 'email' && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>USER TYPE</span>
                  <IconButton size="small" onClick={() => requestSort('role')}>
                    {sortConfig.key === 'role' && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>CREATED</span>
                  <IconButton size="small" onClick={() => requestSort('created_at')}>
                    {sortConfig.key === 'created_at' && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>UPDATED AT</span>
                  <IconButton size="small" onClick={() => requestSort('updated_at')}>
                    {sortConfig.key === 'updated_at' && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
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
              {sortedUsers.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((u) => (
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
                      <IconButton
                        color="primary"
                        aria-label="Edit"
                        size="large"
                        onClick={() => handleOpenUserModal(u)}
                      >
                        <EditIcon />
                      </IconButton>
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
                        onClick={() => handleOpenDeleteDialog(u)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
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
          <Button onClick={handleCloseDeleteDialog}>No</Button>
          <Button onClick={() => onDeleteClick(selectedUser)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit User Modal */}
      <Dialog
        open={openUserModal}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">
          {userForm.id ? "Update User: " + userForm.name : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleUserFormSubmit}>
            <div style={{ position: "relative", display: "inline-block" }}>
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
                  src={avatarPreview || '/path/to/default-avatar.png'}
                  alt="Avatar Preview"
                  sx={{ width: 100, height: 100, marginBottom: 2 }}
                />
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
                <input
                  type="file"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </IconButton>
            </div>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={userForm.name}
              onChange={handleUserFormChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={userForm.email}
              onChange={handleUserFormChange}
              disabled={!!userForm.id} // Disable email field if editing
            />
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">User Type</FormLabel>
              <RadioGroup
                row
                name="role"
                value={userForm.role}
                onChange={handleUserFormChange}
              >
                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                <FormControlLabel value="custodian" control={<Radio />} label="Custodian" />
                <FormControlLabel value="user" control={<Radio />} label="User" />
              </RadioGroup>
            </FormControl>
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={userForm.password}
              onChange={handleUserFormChange}
            />
            {errors && (
              <div className="alert">
                {Object.keys(errors).map((key) => (
                  <p key={key}>{errors[key][0]}</p>
                ))}
              </div>
            )}
            <DialogActions>
              <Button onClick={handleCloseUserModal} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {userForm.id ? "Update" : "Save"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}