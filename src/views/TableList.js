import React,{ useState, useMemo, useRef } from "react";

// react-bootstrap components
import {
  Button,
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { AgGridReact } from 'ag-grid-react';
import * as agGrid from "ag-grid-community";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import ExportPdfComponent from './../components/exportToPdfComponent';
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';
import html2canvas from "html2canvas";

function TableList() {

  const [rowData] = useState([
		{make: "Toyota", model: "Celica", price: 35000},
		{make: "Ford", model: "Mondeo", price: 32000},
		{make: "Porsche", model: "Boxter", price: 72000}
	]);
	const gridStyle = useMemo(() => ({ height: '800px', width: '100%' }), []);
	const [columnDefs] = useState([
			{ field: 'make',sortable: true, filter: true ,editable:true},
			{ field: 'model' , sortable: true, filter: true,editable: true},
			{ field: 'price',sortable: true, filter: true,editable:true}
	]);
	const[gridApi, setGridApi] = useState();
	const inputRef = useRef(null);
	const [isFilePicked, setIsSelected] = useState(false);

	const defaultColDef = useMemo(() => {
		return {
			flex: 1,
			minWidth: 130,
			editable: true,
			resizable: true,
		};
	}, []);

	const onAddRow = () => { 
		gridApi.updateRowData({
			add: [{ make: '', model: '', price: '' }]
				});
	};

	const onGridReady = params => {
		setGridApi(params.api);
		//params.api.sizeColumnsToFit() 
	};

	const gridOptions = {
		// PROPERTIES
		// Objects like myRowData and myColDefs would be created in your application
		rowData: rowData,
		columnDefs: columnDefs,
		pagination: false,
		rowSelection: 'single',

		// EVENTS
		// Add event handlers
		onRowClicked: event => console.log('A row was clicked'),
		onColumnResized: event => console.log('A column was resized'),
		onGridReady: event => console.log('The grid is now ready'),

		// CALLBACKS
		//getRowHeight: (params) => 25
	};

	const changeHandler = (event) => {
		//setSelectedFile(event.target.files[0]);
		//var workbook = convertDataToWorkbook(event.target.files[0]);
		const fileUpload = (document.getElementById('fileUpload'));
		const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
		if (regex.test(fileUpload.value.toLowerCase())) {
				if (typeof (FileReader) !== 'undefined') {
						const reader = new FileReader();
						if (reader.readAsBinaryString) {
								reader.onload = (e) => {
										processExcel(reader.result);
								};
								reader.readAsBinaryString(fileUpload.files[0]);
						}
				} else {
						console.log("This browser does not support HTML5.");
				}
		} else {
				console.log("Please upload a valid Excel file.");
		}
		setIsSelected(true);
	};

	function processExcel(data) {
		const workbook = XLSX.read(data, {type: 'binary'});
		//const firstSheet = workbook.SheetNames[0];
		//const excelRows = window.XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
		populateGrid(workbook);
		//console.log(excelRows);
	};


	// pull out the values we're after, converting it into an array of rowData

	const  populateGrid = (workbook) => {
		// our data is in the first sheet
		var firstSheetName = workbook.SheetNames[0];
		var worksheet = workbook.Sheets[firstSheetName];

		// we expect the following columns to be present
		var columns = {
			A: 'make',
			B: 'model',
			C: 'price',
		};

		var rowData = [];

		// start at the 2nd row - the first row are the headers
		var rowIndex = 2;

		// iterate over the worksheet pulling out the columns we're expecting
		while (worksheet['A' + rowIndex]) {
			var row = {};
			Object.keys(columns).forEach(function (column) {
				row[columns[column]] = worksheet[column + rowIndex].w;
			});

			rowData.push(row);

			rowIndex++;
		}
		// finally, set the imported rowData into the grid
		gridApi .setRowData(rowData);
	};

	// wait for the document to be loaded, otherwise
	// AG Grid will not find the div in the document.
	document.addEventListener('DOMContentLoaded', function () {
		// lookup the container we want the Grid to use
		var eGridDiv = document.querySelector('#myGrid');

		// create the grid passing in the div to use together with the columns & data we want to use
		new agGrid.Grid(eGridDiv, gridOptions);
	});

	const printDocument = () => {
		html2canvas(inputRef.current).then((canvas) => {
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF();
			pdf.addImage(imgData, "JPEG",  3, 3, 210, 300);
			pdf.save("download.pdf");
		});
	};
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12" id="divToPrint" ref={inputRef}>
            <Card>
              <Card.Header>
                <Card.Title as="h4">List</Card.Title>
                <div className ="d-flex justify-content-end pt-3">
                  <span className = "ml-3" >
                    <Button variant="primary" onClick={onAddRow}>Add Row</Button>
                  </span>
                  <span className = "ml-3 btn-file" >
                    <label className ="custom-file" for="customInput">
                      <input type="file" name="file"  id ="fileUpload" accept=".xls,.xlsx"  onChange={changeHandler} aria-describedby="fileHelp" />
                      <span class="custom-file-control form-control-file"></span>
                    </label>
                  </span>
							<span className = "ml-3" >
								<ExportPdfComponent printDocument = {printDocument} />
							</span>
						</div>
              </Card.Header>
              <Card.Body className="p-3">

                <div className="ag-theme-alpine" style={gridStyle} >
                <AgGridReact
                    rowData={rowData}
                    onGridReady={onGridReady}
                    gridOptions={gridOptions}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}>
                </AgGridReact>
              </div>
              </Card.Body>
            </Card>
          </Col>
         </Row>
      </Container>
    </>
  );
}

export default TableList;
