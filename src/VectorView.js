import { Form, Card, Row, Col } from 'react-bootstrap';

export const VectorView = ({ name, vector, onChange }) => {
  return (
    <Card>
      <Card.Header as="h5">{name}</Card.Header>
      <Card.Body>
        {Object.keys(vector).map((axis) => {
          return (
            <Form.Group as={Row} key={`${name}.${axis}`} className="mb-3">
              <Form.Label column sm="3">
                {axis}
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="number"
                  value={vector[axis]}
                  onChange={({ currentTarget }) =>
                    onChange(axis, Number(currentTarget.value))
                  }
                />
              </Col>
            </Form.Group>
          );
        })}
      </Card.Body>
    </Card>
  );
};