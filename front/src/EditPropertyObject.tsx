import React from "react";
import { ObjectPropertySchema } from "./DeviceStore";
import EditProperty from "./EditProperty";

interface EditPropertyObjectProps {
  schema: ObjectPropertySchema;
  currentValue: { [key: string]: unknown };
  onChanged: (newValue: { [key: string]: unknown }) => void;
  readonly: boolean;
}

export default class EditPropertyObject extends React.Component<EditPropertyObjectProps> {
  public render = (): JSX.Element => {
    const value = this.props.currentValue;
    if (typeof value !== "object") {
      return <div />;
    }
    return (
      <table>
        <tbody>
          {Object.keys(this.props.schema.properties).map(
            (propertyName): JSX.Element => {
              return (
                <tr>
                  <th>{propertyName}</th>
                  <td>
                    <EditProperty
                      schema={this.props.schema.properties[propertyName]}
                      readonly={this.props.readonly}
                      currentValue={value[propertyName]}
                      onChanged={(newValue: unknown): void => {
                        value[propertyName] = newValue;
                        this.props.onChanged(value);
                      }}
                    />
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    );
  };
  // static getValueText = (value: any): string => {
  //   if (typeof value === "object") {
  //     return JSON.stringify(value);
  //   }
  //   return value.toString();
  // };
}
