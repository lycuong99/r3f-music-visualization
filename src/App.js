// This is a React Router v5 app
import { Routes, Route, Outlet, Link, BrowserRouter } from "react-router-dom";
import Demo1 from "./Demo1";
import Demo2 from "./Demo2";
import MusicVisualizer from "./MusicVisualizer";
import { Button, Card, CardContent, Container, Grid, Typography } from "@mui/material";
import "./App.css";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/demo1" element={<Demo1 />} />
        <Route path="/demo2" element={<MusicVisualizer />} />
      </Routes>
    </BrowserRouter>
  );
}
const Home = () => {
  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography variant="h4">Demo with dots + plane</Typography>
              <Button LinkComponent={Link} to="/demo1   ">
                Open
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography variant="h4">Demo with lines</Typography>
              <Button LinkComponent={Link} to="/demo2   ">
                Open
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
export default App;
