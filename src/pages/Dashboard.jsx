import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, Grid, Typography, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions 
} from '@mui/material';
import { Add, Logout } from '@mui/icons-material';
import TaskList from '../components/TaskList';
import TaskChart from '../components/TaskChart';
import { getTasks, getTaskAnalytics, createTask } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

import { CSVLink } from 'react-csv';
const csvExcelHeaders = [ 
  { label: "Task Title", key: "title" },
  { label: "Task Description", key: "description" },
  { label: "Category", key: "category" },
  { label: "Due Date", key: "dueDate" },
  { label: "Status", key: "status" },
  { label: "priority", key: "priority"}
 ];

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // To trigger the download
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import {DownloadPDF} from './DownloadPDF'


export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'General',
    dueDate: '',
    priority: 'medium'
  });
  const { authToken, setAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, statsData] = await Promise.all([
          getTasks(authToken),
          getTaskAnalytics(authToken)
        ]);
        setTasks(tasksData.data.tasks);
        setStats(statsData.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const handleDownload = () => {
  // 1. Prepare data: convert array of objects to array of arrays (or use utils.json_to_sheet)
  // SheetJS can directly take an array of objects for simple cases
  const ws = XLSX.utils.json_to_sheet(tasks);

  // If you want custom headers not in the data keys directly:
  // const headerRow = headers.map(h => h.label);
  // XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A1' });
  // XLSX.utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });


  // 2. Create a workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); // Add the worksheet to the workbook

  // 3. Write the workbook to a binary string (or ArrayBuffer)
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // 4. Create a Blob and trigger download
  const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(excelBlob, `tasks.xlsx`);
  };


  const contentRef = useRef(null); // Attach this ref to your table/content HTML element

  const handlePDFDownload = async () => {
    if (!contentRef.current) {
      console.error("Content reference not found for PDF export.");
      return;
    }

    const input = contentRef.current;

    // Use html2canvas to render the HTML element as a canvas
    const canvas = await html2canvas(input, {
      scale: 2, // Increase scale for better quality PDF
      useCORS: true, // If you have images from other domains
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for units, 'a4' for page size

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multiple pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`tasks.pdf`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    navigate('/login');
  };

  const handleCreateTask = async () => {
    try {
      const response = await createTask(newTask, authToken);
      setTasks([...tasks, response.data.task]);
      setOpenTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        category: 'General',
        dueDate: '',
        priority: 'medium'
      });
      // Refresh analytics
      const statsData = await getTaskAnalytics(authToken);
      setStats(statsData.data);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button 
          variant="outlined" 
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Your Tasks</Typography>

                <CSVLink
                  data={tasks}
                  headers={csvExcelHeaders}
                  filename={"tasks.csv"}
                  className="btn btn-primary" // Apply your button styling
                  target="_blank"
                >
                  CSV
                </CSVLink>

                <button onClick={handleDownload} className="btn btn-success">
                  Excel
                </button>

                <button onClick={handlePDFDownload} className="btn btn-danger" style={{ marginTop: '20px' }}>
                  Download PDF
                </button>

                <Button 
                  startIcon={<Add />} 
                  variant="contained"
                  onClick={() => setOpenTaskDialog(true)}
                >                
                  Add Task
                </Button>
              </Box>
              <div ref={contentRef} style={{ padding: '20px', background: 'white' }}>
              <TaskList tasks={tasks} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Task Statistics</Typography>
              {stats && <TaskChart stats={stats} />}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Stats</Typography>
              <Typography>Tasks due today: {stats?.dueToday || 0}</Typography>
              <Typography>Pending tasks: {stats?.stats.find(s => s._id === 'pending')?.count || 0}</Typography>
              <Typography>Completed tasks: {stats?.stats.find(s => s._id === 'completed')?.count || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={newTask.category}
            onChange={(e) => setNewTask({...newTask, category: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Priority"
            select
            fullWidth
            SelectProps={{ native: true }}
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}