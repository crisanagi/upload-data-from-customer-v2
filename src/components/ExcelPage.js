import React, { Component } from "react";
import { Button, Row, Col, Icon, Upload } from "antd";
import MaterialTable from "material-table";
import { ExcelRenderer } from "react-excel-renderer";
import "./excelPage.css";

export default class ExcelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cols: [],
      rows: [],
      errorMessage: null,
      columns: [
        { title: "Field Name", field: "fieldName" },
        {
          title: "Field Description",
          field: "fieldDescription",
          initialEditValue: "initial edit value"
        },
        {
          title: "Data Type",
          field: "dataTypes",
          lookup: { 1: "String", 2: "Number", 3: "DATE" }
        },
        { title: "String Position", field: "stringPosition", type: "numeric" },
        { title: "Length", field: "length", type: "numeric" },
        {
          title: "Mandatory",
          field: "mandatory",
          lookup: { 1: "Y", 2: "N" }
        }
      ],
      data: [
        {
          fieldName: "Field #1",
          fieldDescription: "Field Description #1",
          dataTypes: 1,
          stringPosition: 1,
          length: 2,
          mandatory: 1
        },
        {
          fieldName: "Field #2",
          fieldDescription: "Field Description #2",
          dataTypes: 3,
          stringPosition: 1,
          length: 2,
          mandatory: 2
        }
      ]
    };
  }

  checkFile(file) {
    let errorMessage = "";
    if (!file || !file[0]) {
      return;
    }
    const isExcel =
      file[0].type === "application/vnd.ms-excel" ||
      file[0].type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!isExcel) {
      errorMessage = "You can only upload Excel file!";
    }
    console.log("file", file[0].type);
    const isLt2M = file[0].size / 1024 / 1024 < 2;
    if (!isLt2M) {
      errorMessage = "File must be smaller than 2MB!";
    }
    console.log("errorMessage", errorMessage);
    return errorMessage;
  }

  fileHandler = fileList => {
    console.log("fileList", fileList);
    let fileObj = fileList;
    if (!fileObj) {
      this.setState({
        errorMessage: "No file uploaded!"
      });
      return false;
    }
    console.log("fileObj.type:", fileObj.type);
    if (
      !(
        fileObj.type === "application/vnd.ms-excel" ||
        fileObj.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      this.setState({
        errorMessage: "Unknown file format. Only Excel files are uploaded!"
      });
      return false;
    }
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let newRows = [];
        // eslint-disable-next-line array-callback-return
        resp.rows.slice(1).map((row, index) => {
          if (row && row !== "undefined") {
            newRows.push({
              key: index,
              fieldName: row[0],
              fieldDescription: row[1],
              dataTypes: row[2] === "STRING" ? 1 : row[2] === "NUMBER" ? 2 : 3,
              stringPosition: row[3],
              length: row[4],
              mandatory: row[5] === "Y" ? 1 : 2
            });
          }
        });
        if (newRows.length === 0) {
          this.setState({
            errorMessage: "No data found in file!"
          });
          return false;
        } else {
          this.setState({
            cols: resp.cols,
            rows: newRows,
            errorMessage: null
          });
        }
      }
    });
    return false;
  };

  render() {
    return (
      <>
        {/* <h1>Importing Excel Component</h1> */}
        <Row gutter={16}>
          <Col
            span={8}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "5%"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="page-title" />
            </div>
          </Col>
        </Row>
        <div style={{ paddingLeft: "1089px" }}>
          <Upload
            name="file"
            beforeUpload={this.fileHandler}
            onRemove={() => this.setState({ rows: [] })}
            multiple={false}
          >
            <Button>
              <Icon type="upload" /> Click to Upload Excel File
            </Button>
          </Upload>
        </div>
        <div style={{ marginTop: 20 }}>
          <MaterialTable
            title="Supplier Import Excel Component"
            columns={this.state.columns}
            data={this.state.rows}
            editable={{
              onRowAdd: newData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      const data = this.state.data;
                      data.push(newData);
                      this.setState({ data }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      const data = this.state.data;
                      const index = data.indexOf(oldData);
                      data[index] = newData;
                      this.setState({ data }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      let data = this.state.data;
                      const index = data.indexOf(oldData);
                      data.splice(index, 1);
                      this.setState({ data }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                })
            }}
          />
        </div>
      </>
    );
  }
}
