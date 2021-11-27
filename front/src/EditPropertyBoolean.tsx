import { Switch } from "@material-ui/core";
import React from "react";
import { BooleanPropertySchema } from "./DeviceStore";

interface EditPropertyBooleanProps {
  schema: BooleanPropertySchema;
  currentValue: boolean;
  onChanged: (newValue: boolean) => void;
  readonly: boolean;
}

export default class EditPropertyBoolean extends React.Component<EditPropertyBooleanProps> {
  public render = (): JSX.Element => {
    const value = this.props.currentValue;
    if (typeof value !== "boolean") {
      return <div />;
    }
    return (
      <Switch
        checked={value}
        onChange={(
          event: React.ChangeEvent<HTMLInputElement>,
          checked: boolean
        ) => {
          this.props.onChanged(checked);
        }}
        readOnly={this.props.readonly}
      />
    );
  };
}
