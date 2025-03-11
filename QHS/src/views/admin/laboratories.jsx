import React, { useState, useEffect } from "react"; // Import React
import { Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import moment from "moment";

import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';

import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Import Grid and Box components from Material-UI
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Divider } from "@mui/material";

export default function laboratories() {
  const [Laboratory, setLaboratory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLaboratory();
  }, []);

  const getLaboratory = () => {
    setLoading(true);
    axiosClient
      .get("/laboratories")
      .then(({ data }) => {
        setLoading(false);
        setLaboratory(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onDeleteClick = (laboratory) => {
    axiosClient.delete(`/adminLab/${laboratory.id}`).then(() => {
      getLaboratory();
    });
  };

  // Alert
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ Padding: 0 }}> {/* Add padding to the entire page */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead> 
            <TableRow>
              <TableCell sx={{backgroundColor:'white'}}>
                <Typography variant="h5" sx={{ color: 'maroon' }}>List of Laboratories</Typography>
                <Typography variant="body" sx={{ color: 'gray', overflowWrap: 'break-word' }}>Browse and manage the available laboratories.</Typography>
              </TableCell>
              <TableCell align="right" sx={{backgroundColor:'white'}}>
                <Link to="new">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: "white",
                      color: "maroon",
                    }}
                  >
                    Add new Laboratory
                  </Button>
                  <br />
                </Link>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      <TableContainer component={Paper} align="center" sx={{ boxShadow: "none" }}>
        <Table aria-label="sticky table">
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
            <TableBody sx={{
              align: 'center',
            }}>
              {/* Use Material-UI Grid for responsive layout */}
              <Grid container spacing={2} sx={{
                padding: 3,
                align: "middle",
              }}>
                {Laboratory.map((u) => (
                  <Grid item xs={12} sm={6} md={3} key={u.id} align="center">
                    <Card sx={{ maxWidth: 300, height: 300, width: 'auto' }} elevation={8}>
                      <CardActionArea>
                        <Link to={`${u.name}/${u.id}`} style={{ textDecoration: 'none' }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={u.gallery ? 'http://192.168.254.219:8000/storage/' + u.gallery : 'http://192.168.254.219:8000/storage/gallery/default_image.jpg'}
                            alt={u.name}
                          />
                          <CardContent sx={{ padding: '10px', Height: '81px' }}>
                            <Typography gutterBottom variant="h5" component="div" sx={{ height: '33px', overflow: 'hidden', color: 'maroon' }}>
                              {u.name}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: 'text.secondary', overflowWrap: 'break-word' }}>
                              {u.location}
                            </Typography>
                          </CardContent>
                          <Divider></Divider>
                        </Link>
                      </CardActionArea>

                      <CardActions sx={{ justifyContent: 'right' }}>
                        <Link to={`${u.id}`}>
                          <Button size="small" color="primary">
                            EDIT
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          align="right"
                          color="error"
                          onClick={handleClickOpen}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" color="error">
          Delete Laboratory
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this Laboratory?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={onDeleteClick} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}