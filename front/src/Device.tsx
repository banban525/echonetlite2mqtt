import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Button,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React from "react";
import { inject, observer } from "mobx-react";
import { DeviceProperty, DeviceStore } from "./DeviceStore";
import { Link, RouteComponentProps } from "react-router-dom";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import EditProperty from "./EditProperty";

interface DeviceProps extends RouteComponentProps<{ id: string }> {
  device: DeviceStore;
}

@inject("device")
@observer
export default class Device extends React.Component<DeviceProps> {
  public componentDidMount(): void {
    const id = this.props.match.params.id;
    const store = this.props.device;
    store.initialize(id);
  }

  public componentDidUpdate(): void {
    const id = this.props.match.params.id;
    const store = this.props.device;
    store.initialize(id);
  }
  public componentWillUnmount(): void {
    const store = this.props.device;
    store.terminate();
  }

  render(): JSX.Element {
    const store = this.props.device;
    return (
      <div
        className="Device"
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
        <table>
          <tbody>
            <tr>
              <th>Id</th>
              <td>{store.device.id}</td>
            </tr>
            <tr>
              <th>Type</th>
              <td>{store.device.deviceType}</td>
            </tr>
            <tr>
              <th>IP</th>
              <td>{store.device.ip}</td>
            </tr>
            <tr>
              <th>EOJ</th>
              <td>{store.device.eoj}</td>
            </tr>
            <tr>
              <th>mqtt topic</th>
              <td>{store.device.mqttTopics}</td>
            </tr>
          </tbody>
        </table>

        <h3>All Properies</h3>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <KeyboardArrowDownIcon />
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(store.device.propertyValues, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <h3>Properties</h3>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>description</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Operation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {store.device.properties.map(
                (property: DeviceProperty): JSX.Element => (
                  <React.Fragment key={`property-${property.name}`}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() =>
                            store.toggleOpenProperty(property.name)
                          }
                        >
                          {store.expandedPropertyName === property.name ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{property.name}</TableCell>
                      <TableCell>{property.descriptions.ja}</TableCell>
                      <TableCell>
                        <TextField
                          value={Device.getValueText(
                            store.device.propertyValues[property.name]
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {"get " +
                          (property.writable ? "set " : "") +
                          (property.observable ? "notify" : "")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                      ></TableCell>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                      >
                        <Collapse
                          in={store.expandedPropertyName === property.name}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Grid container>
                            <Grid item xs={12} md={6}>
                              <Paper>
                                <table>
                                  <tbody>
                                    <tr>
                                      <th>descriptions(en)</th>
                                      <td>{property.descriptions.en}</td>
                                    </tr>
                                    <tr>
                                      <th>EPC</th>
                                      <td>{property.epc}</td>
                                    </tr>
                                    <tr>
                                      <th>get mqtt topic</th>
                                      <td>{property.mqttTopics}</td>
                                    </tr>
                                    <tr>
                                      <th>set mqtt topic</th>
                                      <td>{property.mqttTopics + "/set"}</td>
                                    </tr>
                                    <tr>
                                      <th>hold mqtt topic</th>
                                      <td>{property.mqttTopics + "/hold"}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </Paper>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              style={{
                                display: property.writable ? "" : "none",
                              }}
                            >
                              <Paper>
                                <b>
                                  Edit Parameter
                                  <br />
                                </b>
                                <EditProperty
                                  schema={property.schema}
                                  currentValue={store.editingValue}
                                  onChanged={(newValue: unknown) => {
                                    store.updateEditingValue(newValue);
                                  }}
                                  readonly={property.writable === false}
                                />
                                <div>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={store.updateValue}
                                  >
                                    Set
                                  </Button>
                                </div>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
  static getValueText = (value: unknown): string => {
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (value as any).toString();
  };
}
