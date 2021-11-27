import React from "react";
import { DevicePropertySchema } from "./DeviceStore";
import EditPropertyArray from "./EditPropertyArray";
import EditPropertyBoolean from "./EditPropertyBoolean";
import EditPropertyMixed from "./EditPropertyMixed";
import EditPropertyNumber from "./EditPropertyNumber";
import EditPropertyObject from "./EditPropertyObject";
import EditPropertyString from "./EditPropertyString";

interface EditPropertyProps {
  schema: DevicePropertySchema;
  currentValue: unknown;
  readonly: boolean;
  onChanged: (newValue: unknown) => void;
}

export default class EditProperty extends React.Component<EditPropertyProps> {
  public render = (): JSX.Element => {
    const schema = this.props.schema;
    if ("type" in schema) {
      if (schema.type === "object") {
        return (
          <EditPropertyObject
            currentValue={this.props.currentValue as { [key: string]: unknown }}
            schema={schema}
            onChanged={this.props.onChanged}
            readonly={this.props.readonly}
          />
        );
      }
      if (schema.type === "null") {
        return <div />;
      }
      if (schema.type === "array") {
        return (
          <EditPropertyArray
            currentValue={this.props.currentValue as unknown[]}
            schema={schema}
            onChanged={this.props.onChanged}
            readonly={this.props.readonly}
          />
        );
      }
      if (schema.type === "boolean") {
        return (
          <EditPropertyBoolean
            currentValue={this.props.currentValue as boolean}
            schema={schema}
            onChanged={this.props.onChanged}
            readonly={this.props.readonly}
          />
        );
      }
      if (schema.type === "number") {
        return (
          <EditPropertyNumber
            currentValue={this.props.currentValue as number}
            schema={schema}
            onChanged={this.props.onChanged}
            readonly={this.props.readonly}
          />
        );
      }
      if (schema.type === "string") {
        return (
          <EditPropertyString
            currentValue={this.props.currentValue as string}
            schema={schema}
            onChanged={this.props.onChanged}
            readonly={this.props.readonly}
          />
        );
      }
    } else {
      return (
        <EditPropertyMixed
          currentValue={this.props.currentValue}
          schema={schema}
          onChanged={this.props.onChanged}
          readonly={this.props.readonly}
        />
      );
    }
    return <div />;
  };
}
