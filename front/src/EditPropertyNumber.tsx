import { TextField } from "@material-ui/core";
import React from "react";
import { NumberPropertySchema } from "./DeviceStore";

interface EditPropertyNumberProps {
  schema: NumberPropertySchema;
  currentValue: number;
  onChanged: (newValue: number) => void;
  readonly: boolean;
}

export default class EditPropertyNumber extends React.Component<EditPropertyNumberProps> {
  public render = (): JSX.Element => {
    const minimum = this.props.schema.minimum;
    const maximum = this.props.schema.maximum;
    const unit = this.props.schema.unit;

    const value = this.props.currentValue;
    if (typeof value !== "number") {
      return <div />;
    }

    let rangeLabel = "";
    if (minimum !== undefined && maximum !== undefined) {
      rangeLabel = `(${minimum} - ${maximum})`;
    } else if (minimum !== undefined && maximum === undefined) {
      rangeLabel = `(${minimum} - )`;
    } else if (minimum === undefined && maximum !== undefined) {
      rangeLabel = `( - ${maximum})`;
    } else {
      rangeLabel = "";
    }

    const unitText = unit !== undefined ? `${unit}` : "";

    return (
      <TextField
        id="standard-number"
        label={`${unitText} ${rangeLabel}`}
        type="number"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const value = Number(event.target.value);
          this.props.onChanged(value);
        }}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: this.props.readonly,
        }}
      />
    );
  };
}
