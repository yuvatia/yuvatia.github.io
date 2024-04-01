import { Row, Col, Form } from 'react-bootstrap';

export const VectorView = ({ name, vector, onChange }) => {
  return (
    <div style={{ display: 'flex', marginBottom: '1rem' }}>
      {Object.keys(vector).map((axis, index) => (
        <div key={`${name}.${axis}`} style={{ flex: 1, paddingLeft: index !== 0 ? '0.25rem' : '0' }}>
          <input
            style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.5rem',
              width: '100%',
              appearance: 'textfield'
            }}
            type="number"
            value={vector[axis]}
            onChange={({ currentTarget }) =>
              onChange(axis, Number(currentTarget.value))
            }
          />
        </div>
      ))}
    </div>);
};