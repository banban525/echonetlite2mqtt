import React from "react";
import { StringPropertySchema } from "./DeviceStore";
import { KeyboardDatePicker, KeyboardTimePicker } from "@material-ui/pickers";
import { MenuItem, Select, TextField } from "@material-ui/core";

interface EditPropertyStringProps {
  schema: StringPropertySchema;
  currentValue: string;
  onChanged: (newValue: string) => void;
  readonly: boolean;
}
interface EditPropertyStringState {
  selectedMenuIndex: number;
}

export default class EditPropertyString extends React.Component<
  EditPropertyStringProps,
  EditPropertyStringState
> {
  constructor(props: EditPropertyStringProps) {
    super(props);

    let defaultSelectedMenuIndex = 0;
    if (props.schema.values !== undefined) {
      defaultSelectedMenuIndex = props.schema.values.findIndex(
        (_) => _.value === props.currentValue
      );
      if (defaultSelectedMenuIndex === -1) {
        defaultSelectedMenuIndex = 0;
      }
    }

    this.state = { selectedMenuIndex: defaultSelectedMenuIndex };
  }
  public render = (): JSX.Element => {
    if (this.props.readonly) {
      return (
        <TextField
          defaultValue={this.props.currentValue}
          InputProps={{
            readOnly: this.props.readonly,
          }}
        />
      );
    }
    if (this.props.schema.format !== undefined) {
      if (this.props.schema.format === "date") {
        const value = new Date(this.props.currentValue);
        return (
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="yyyy-MM-dd"
            margin="normal"
            id="date-picker-inline"
            label="Date picker inline"
            value={value}
            onChange={() => {
              //
            }}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
        );
      }
      if (this.props.schema.format === "time") {
        const value = new Date(this.props.currentValue);
        return (
          <KeyboardTimePicker
            margin="normal"
            id="time-picker"
            label="Time picker"
            value={value}
            onChange={() => {
              //
            }}
            KeyboardButtonProps={{
              "aria-label": "change time",
            }}
          />
        );
      }
      if (this.props.schema.format === "date-time") {
        const value = new Date(this.props.currentValue);
        return (
          <TextField
            id="datetime-local"
            label="Next appointment"
            type="datetime-local"
            defaultValue={value}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );
      }
    } else {
      if (
        this.props.schema.values !== undefined &&
        this.props.schema.values.length > 0
      ) {
        return (
          <Select
            value={this.props.currentValue}
            onChange={(
              event: React.ChangeEvent<{
                name?: string | undefined;
                value: unknown;
              }>
            ) => {
              const newValue = event.target.value as string;
              this.props.onChanged(newValue);
            }}
          >
            {this.props.schema.values.map(
              (_): JSX.Element => (
                <MenuItem key={_.value} value={_.value}>
                  {`${_.descriptions.ja} (${_.value})`}
                </MenuItem>
              )
            )}
          </Select>
        );
      } else {
        return <TextField defaultValue={this.props.currentValue} />;
      }
    }
    return <div />;
  };
}
