import React from 'react';
import Button from "react-bootstrap/Button";
const ExportPdfComponent = (props) => {
  return (
      <Button  variant="info" className="ml-3 mb-3"  onClick={props.printDocument}>Print to PDF!</Button>
  );
}
export default ExportPdfComponent;