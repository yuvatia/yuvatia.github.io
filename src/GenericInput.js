import { VectorView } from './VectorView';
import { Point, Vector } from './engine/src/math';


export const GenericInput = ({ fieldType, name, value, onChange, onVectorChange }) => {
  switch (fieldType) {
    case Vector.name:
    case Point.name:
      return (
        <VectorView
          key={name}
          name={name}
          vector={value}
          onChange={(axis, value) => {
            onVectorChange(name, axis, value);
          }}></VectorView>
      );
    case String.name:
      return (
        <div key={name}>
          <p>{name}</p>
          <input
            key={`${fieldType}.${name}`}
            type="text"
            value={value}
            onChange={({ currentTarget }) => onChange(name, currentTarget.value)} />
        </div>
      );
    case Number.name:
      return (
        <div key={name}>
          <p>{name}</p>
          <input
            key={name}
            type="number"
            value={value}
            onChange={({ currentTarget }) => onChange(name, Number(currentTarget.value))} />
        </div>
      );
    case Boolean.name:
      return (
        <div key={name}>
          <p>{name}</p>
          <input
            key={name}
            type="checkbox"
            checked={value}
            onChange={({ currentTarget }) => onChange(name, currentTarget.checked)} />
        </div>
      );
    default:
      return (
        <div key={name}>
          <p>{name}</p>
          <p>No specialized input for {fieldType}</p>
        </div>
      );
  }
};
