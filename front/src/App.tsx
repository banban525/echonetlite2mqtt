import React from "react";
import "./App.css";
import {
  AppBar,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { AppStore, DeviceSummary } from "./AppStore";
import { inject, observer } from "mobx-react";

interface AppProps {
  app: AppStore;
}

@inject("app")
@observer
export default class App extends React.Component<AppProps> {
  public componentDidMount(): void {
    const store = this.props.app;
    store.initialize();
  }

  public componentDidUpdate(): void {
    //const store = this.props.app;
    //store.initialize();
  }
  public componentWillUnmount(): void {
    const store = this.props.app;
    store.terminate();
  }

  render(): JSX.Element {
    const store = this.props.app;
    return (
      <div
        className="Home"
        style={{ marginLeft: "2%", marginRight: "2%", marginTop: "5px" }}
      >
        <AppBar position="static" style={{ marginBottom: "10px" }}>
          <Toolbar>
            <Link
              to="/"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              <Typography variant="h6">ECHONETLite2mqtt</Typography>
            </Link>
          </Toolbar>
        </AppBar>
        <Grid container spacing={1}>
          <Grid item xs={4} sm={2} md={2} lg={1} xl={1}>
            <Paper>
              <FormControl fullWidth>
                <InputLabel>MQTT</InputLabel>
                <Input
                  type="text"
                  value="　"
                  endAdornment={
                    <InputAdornment position="end">
                      {store.status.mqttState}
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <h3>Devices</h3>
            <TableContainer component={Paper} style={{ maxHeight: "400px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {store.status.devices.map(
                    (device: DeviceSummary): JSX.Element => (
                      <TableRow>
                        <TableCell>
                          <Link to={`/devices/${device.id}`}>{device.id}</Link>
                        </TableCell>
                        <TableCell>{device.deviceType}</TableCell>
                        <TableCell>{device.ip}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <h3>Logs</h3>
            <TableContainer component={Paper} style={{ maxHeight: "400px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell>Date &amp; Time</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {store.logs.map(
                    (log): JSX.Element => (
                      <TableRow>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log.datetime}</TableCell>
                        <TableCell>{log.message}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </div>
    );
  }
}
