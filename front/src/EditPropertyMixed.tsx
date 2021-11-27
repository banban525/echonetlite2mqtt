import { Radio } from "@material-ui/core";
import React from "react";
import {
  BooleanPropertySchema,
  DevicePropertySchema,
  MixedTypePropertySchema,
  StringPropertySchema,
} from "./DeviceStore";
import EditProperty from "./EditProperty";

interface EditPropertyMixedProps {
  schema: MixedTypePropertySchema;
  currentValue: unknown;
  onChanged: (newValue: unknown) => void;
  readonly: boolean;
}

interface EditPropertyMixedState {
  selectedIndex: number;
}

export default class EditPropertyMixed extends React.Component<
  EditPropertyMixedProps,
  EditPropertyMixedState
> {
  constructor(props: EditPropertyMixedProps) {
    super(props);
    // const value = this.props.currentValue;
    // const mixedSchema = this.props.schema;
    // const schemas = EditPropertyMixed.flatSchema(mixedSchema.oneOf);

    this.state = { selectedIndex: 0 };
  }
  public render = (): JSX.Element => {
    const value = this.props.currentValue;
    const mixedSchema = this.props.schema;

    const schemas = EditPropertyMixed.flatSchema(mixedSchema.oneOf);
    let defaultSelectedIndex = EditPropertyMixed.selectValueSchema(
      value,
      schemas
    );

    if (defaultSelectedIndex < 0) {
      defaultSelectedIndex = 0;
    }
    //const selectedSchema = schemas[defaultSelectedIndex];

    const valuesSchemas = schemas.filter(EditPropertyMixed.filterExistsValues);
    const noValuesSchemas = schemas.filter(
      EditPropertyMixed.filterNotExistsValues
    );

    return (
      <div>
        <table>
          <tbody>
            {valuesSchemas.map(
              (schema, index): JSX.Element => (
                <tr key={EditPropertyMixed.getFirstValueText(schema)}>
                  <td>
                    <Radio
                      checked={index === defaultSelectedIndex}
                      onClick={() => {
                        this.props.onChanged(
                          EditPropertyMixed.getFirstValueText(schema)
                        );
                      }}
                      readOnly={this.props.readonly}
                    />
                  </td>
                  <td>{EditPropertyMixed.getFirstValueText(schema)}</td>
                </tr>
              )
            )}
            {noValuesSchemas.map(
              (schema, index): JSX.Element => (
                <tr key={EditPropertyMixed.getSchemaTypeName(schema)}>
                  <td>
                    <Radio
                      checked={
                        valuesSchemas.length + index === defaultSelectedIndex
                      }
                      onClick={() => {
                        if (
                          valuesSchemas.length + index !==
                          defaultSelectedIndex
                        ) {
                          this.props.onChanged(
                            EditPropertyMixed.getValue(schema, value)
                          );
                        }
                      }}
                      readOnly={this.props.readonly}
                    />
                  </td>
                  <td>
                    <EditProperty
                      schema={schema}
                      currentValue={EditPropertyMixed.getValue(schema, value)}
                      readonly={this.props.readonly}
                      onChanged={(newValue: unknown) => {
                        this.props.onChanged(newValue);
                      }}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    );
  };

  private static filterExistsValues = (
    schema: DevicePropertySchema
  ): boolean => {
    if ("type" in schema) {
      if (schema.type === "boolean") {
        return schema.values.length !== 0;
      }
      if (schema.type === "string") {
        return (schema.values ?? []).length !== 0;
      }
    }
    return false;
  };
  private static filterNotExistsValues = (
    schema: DevicePropertySchema
  ): boolean => {
    return EditPropertyMixed.filterExistsValues(schema) === false;
  };

  private static getSchemaTypeName = (schema: DevicePropertySchema): string => {
    if ("type" in schema) {
      return schema.type;
    } else {
      return "mixed";
    }
  };

  private static getFirstValueText = (schema: DevicePropertySchema): string => {
    if ("type" in schema) {
      if (schema.type === "boolean") {
        return schema.values[0].value.toString();
      }
      if (schema.type === "string" && schema.values !== undefined) {
        return schema.values[0].value;
      }
    }
    return "";
  };

  private static flatSchema = (schemas: DevicePropertySchema[]) => {
    const flatSchemaList = schemas
      .map((oneOfSchema): DevicePropertySchema[] => {
        if ("type" in oneOfSchema) {
          if (oneOfSchema.type === "boolean") {
            return oneOfSchema.values.map((val): DevicePropertySchema => {
              const copy = JSON.parse(
                JSON.stringify(oneOfSchema)
              ) as BooleanPropertySchema;
              copy.values = [val];
              return copy;
            });
          }
          if (oneOfSchema.type === "string") {
            if (oneOfSchema.values === undefined) {
              return [oneOfSchema];
            }
            return oneOfSchema.values.map((val): DevicePropertySchema => {
              const copy = JSON.parse(
                JSON.stringify(oneOfSchema)
              ) as StringPropertySchema;
              copy.values = [val];
              copy.enum = [val.value];
              return copy;
            });
          }
        }
        return [oneOfSchema];
      })
      .flat();

    const results: DevicePropertySchema[] = [];
    flatSchemaList.filter(EditPropertyMixed.filterExistsValues).forEach((_) => {
      results.push(_);
    });
    flatSchemaList
      .filter(EditPropertyMixed.filterNotExistsValues)
      .forEach((_) => {
        results.push(_);
      });

    return results;
  };

  private static selectValueSchema = (
    value: unknown,
    schemaList: DevicePropertySchema[]
  ): number => {
    for (let i = 0; i < schemaList.length; i++) {
      const schema = schemaList[i];
      if ("type" in schema) {
        if (schema.type === "boolean" && typeof value === "boolean") {
          return i;
        }
        if (schema.type === "string") {
          if (schema.values?.find((_) => _.value === value) !== undefined) {
            return i;
          }
        }

        if (schema.type === "string" && schema.format === "date") {
          if (typeof value === "string") {
            if (value.match(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{1,2}/) !== null) {
              return i;
            }
          }
        }
        if (schema.type === "string" && schema.format === "date-time") {
          if (typeof value === "string") {
            if (
              value.match(
                /[0-9]{1,2}-[0-9]{1,2}-[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/
              ) !== null
            ) {
              return i;
            }
          }
        }
        if (schema.type === "string" && schema.format === "time") {
          if (typeof value === "string") {
            if (value.match(/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/) !== null) {
              return i;
            }
          }
        }
        if (schema.type === "number" && typeof value === "number") {
          return i;
        }
        if (schema.type === "array" && typeof value === "object") {
          if (JSON.stringify(value).match(/^\[.*\]$/) !== null) {
            return i;
          }
        }
        if (schema.type === "object" && typeof value === "object") {
          if (JSON.stringify(value).match(/^{.*}$/) !== null) {
            return i;
          }
        }
      }
    }
    return -1;
  };

  private static getValue(
    schema: DevicePropertySchema,
    value: unknown
  ): unknown {
    if ("type" in schema) {
      if (schema.type === "boolean") {
        return typeof value === "boolean" ? value : false;
      }
      if (schema.type === "number") {
        if (typeof value === "number") {
          return value;
        }
        if (schema.minimum !== undefined && schema.maximum !== undefined) {
          return Math.round(
            (schema.maximum - schema.minimum) / 2 + schema.minimum
          );
        }
        if (schema.minimum !== undefined && schema.maximum === undefined) {
          return schema.minimum;
        }
        if (schema.minimum === undefined && schema.maximum !== undefined) {
          return schema.maximum;
        }
        if (schema.minimum === undefined && schema.maximum === undefined) {
          return 0;
        }
        return 0;
      }
      if (schema.type === "string") {
        if (typeof value === "string") {
          return value;
        }
        if (schema.values !== undefined && schema.values.length > 0) {
          return schema.values[0].value;
        }
        return "";
      }
      if (schema.type === "array") {
        return [];
      }
      if (schema.type === "object") {
        if (typeof value === "object" && value !== null) {
          return value;
        }
        const result: { [key: string]: unknown } = {};
        for (const property in schema.properties) {
          const subValueSchema = schema.properties[property];
          const subValue = null;

          const newValue = EditPropertyMixed.getValue(subValueSchema, subValue);
          result[property] = newValue;
        }
        return result;
      }
      return value;
    } else {
      // mixed
      return value;
    }
    return 0;
  }
}
