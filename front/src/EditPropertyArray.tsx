import React from "react";
import { ArrayPropertySchema } from "./DeviceStore";
import EditProperty from "./EditProperty";

interface EditPropertyArrayProps {
  schema: ArrayPropertySchema;
  currentValue: unknown[];
  onChanged: (newValue: unknown[]) => void;
  readonly: boolean;
}

export default class EditPropertyArray extends React.Component<EditPropertyArrayProps> {
  public render = (): JSX.Element => {
    const value = this.props.currentValue;
    if (typeof value !== "object") {
      return <div />;
    }
    return (
      <table>
        <tbody>
          {value.map((item, index: number): JSX.Element => {
            return (
              <tr>
                <th>{index}:</th>
                <td>
                  <EditProperty
                    schema={this.props.schema.items}
                    currentValue={item}
                    readonly={this.props.readonly}
                    onChanged={(newValue: unknown): void => {
                      value[index] = newValue;
                      this.props.onChanged(value);
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
}
