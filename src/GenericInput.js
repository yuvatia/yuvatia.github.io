import { VectorView } from './VectorView';


export const GenericInput = ({ fieldType, name, value, onChange, onVectorChange }) => {
  switch (fieldType) {
    case 'Vector':
    case 'Point':
      return (
        <VectorView
          key={name}
          name={name}
          vector={value}
          onChange={(axis, value) => {
            onVectorChange(name, axis, value);
          }}></VectorView>
      );
    case 'String':
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
    case 'Number':
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
    case 'Boolean':
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
