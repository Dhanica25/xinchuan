let employees = [];
let employeeCounter = 1;
let selectedEmployeeId = null; // For tracking the employee selected for removal

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("datePicker").addEventListener("change", function () {
    filterByDate(this.value);
  });

  // Initially hide Done button
  document.getElementById("doneButton").style.display = "none";
  document.getElementById("filterPosition").addEventListener("change", filterTable);
  document.getElementById("searchEmployee").addEventListener("input", filterTable);
});

function addEmployee() {
  const tbody = document.getElementById("employeeTableBody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="checkbox" class="employeeCheckbox"></td>
    <td>${String(employeeCounter).padStart(3, '0')}</td>
    <td><input type="text" placeholder="Enter Name" oninput="updateEmployee(${employeeCounter}, 'name', this.value)" /></td>
    <td>
      <select onchange="updateEmployee(${employeeCounter}, 'position', this.value)">
        <option value="--------">--------</option>
        <option value="Engineer">Engineer</option>
        <option value="Foreman">Foreman</option>
        <option value="Labor">Labor</option>
        <option value="Welder">Welder</option>
        <option value="Scaffolder">Scaffolder</option>
      </select>
    </td>
    <td><input type="time" onchange="updateEmployee(${employeeCounter}, 'timeIn', this.value)" /></td>
    <td><input type="time" onchange="updateEmployee(${employeeCounter}, 'timeOut', this.value)" /></td>
    <td><input type="time" onchange="updateEmployee(${employeeCounter}, 'otIn', this.value)" /></td>
    <td><input type="time" onchange="updateEmployee(${employeeCounter}, 'otOut', this.value)" /></td>
    <td>
      <select onchange="updateEmployee(${employeeCounter}, 'status', this.value)">
        <option value="--------">--------</option>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Halfday">Halfday</option>
        <option value="Holiday">Holiday</option>
        <option value="Late">Late</option>
      </select>
      <input type="text" class="late-input" placeholder="Enter Late Time (Minutes/Hours)" onchange="updateEmployee(${employeeCounter}, 'late', this.value)" />
    </td>
  `;
  tbody.appendChild(newRow);

  employees.push({
    id: String(employeeCounter).padStart(3, '0'),
    name: "",
    position: "",
    timeIn: "",
    timeOut: "",
    otIn: "",
    otOut: "",
    status: "",
    late: "",
    date: document.getElementById("datePicker").value
  });

  employeeCounter++;
  document.getElementById("doneButton").style.display = "inline-block"; // Show Done button when adding or editing
}

function updateEmployee(employeeId, field, value) {
  const employee = employees.find(emp => emp.id === String(employeeId).padStart(3, '0'));
  if (employee) {
    employee[field] = value;
  }
  // Ensure Done button is visible after any change in the table (adding or editing)
  document.getElementById("doneButton").style.display = "inline-block";
}

function doneEditing() {
  // Logic to save or process the changes when done editing
  alert("Changes have been saved!");
  document.getElementById("doneButton").style.display = "none"; // Hide Done button after saving
}

function showRemoveConfirmation(employeeId) {
  // Show the popup when trying to remove an employee
  selectedEmployeeId = employeeId;
  document.getElementById("removePopup").style.display = "flex";
}

function removeEmployee() {
  // Find and remove the employee
  const index = employees.findIndex(emp => emp.id === String(selectedEmployeeId).padStart(3, '0'));
  if (index > -1) {
    employees.splice(index, 1); // Remove the employee from the array
    document.getElementById("employeeTableBody").deleteRow(index); // Remove from table
  }
  // Reassign IDs to the remaining employees
  const rows = document.getElementById("employeeTableBody").rows;
  for (let i = 0; i < rows.length; i++) {
    rows[i].cells[1].innerText = i + 1; // Update the Employee ID in the table
    employees[i].id = i + 1; // Update the ID in the employee array
  }
  closePopup();
}

function closePopup() {
  // Hide the popup (whether Yes or No)
  document.getElementById("removePopup").style.display = "none";
}

function updateEmployeeIds() {
  const rows = document.querySelectorAll("#employeeTableBody tr");
  rows.forEach((row, index) => {
    const employeeIdCell = row.cells[1];
    employeeIdCell.textContent = String(index + 1).padStart(3, '0');
    employees[index].id = String(index + 1).padStart(3, '0');
  });
}

function filterTable() {
  const searchText = document.getElementById("searchEmployee").value.toLowerCase();
  const selectedPosition = document.getElementById("filterPosition").value;
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchText) ||
                          emp.position.toLowerCase().includes(searchText) ||
                          emp.id.toLowerCase().includes(searchText);
    const matchesPosition = selectedPosition === "All" || emp.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const tbody = document.getElementById("employeeTableBody");
  tbody.innerHTML = ""; // Clear the table
  filteredEmployees.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  filteredEmployees.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="employeeCheckbox"></td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.position}</td>
      <td>${emp.timeIn}</td>
      <td>${emp.timeOut}</td>
      <td>${emp.otIn}</td>
      <td>${emp.otOut}</td>
      <td>${emp.status}</td>
    `;
    tbody.appendChild(row);
  });
}
function generateAttendanceReport(startDate, endDate) {
  let totalWorkingDays = 0;
  let totalOvertime = 0;
  let totalLate = 0;
  const reportData = [];

  console.log("Generating report from", startDate, "to", endDate);
  employees.forEach(employee => {
    if (new Date(employee.date) >= new Date(startDate) && new Date(employee.date) <= new Date(endDate)) {
      console.log("Processing employee:", employee);
      let workingDays = (employee.status === 'Present' || employee.status === 'Halfday' || employee.status === 'Late') ? 1 : 0;
      totalWorkingDays += workingDays;

      let overtime = 0;
      if (employee.otIn && employee.otOut) {
        const otIn = new Date('1970-01-01T' + employee.otIn + 'Z');
        const otOut = new Date('1970-01-01T' + employee.otOut + 'Z');
        overtime = (otOut - otIn) / 3600000;
        totalOvertime += overtime;
      }

      let late = 0;
      if (employee.status === 'Late' && employee.late) {
        const lateParts = employee.late.split('/');
        if (lateParts.length === 2) {
          const lateValue = parseFloat(lateParts[0]);
          late = (lateParts[1].toLowerCase().trim() === 'hours') ? lateValue * 60 : lateValue;
        }
        totalLate += late;
      }

      reportData.push({
        name: employee.name,
        position: employee.position,
        workingDays: workingDays,
        overtime: overtime,
        late: late
      });
    }
  });

  console.log("Collected Report Data:", reportData);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Attendance Report (${startDate} to ${endDate})`, 20, 20);

  const columns = ['Name', 'Position', 'Working Days', 'Overtime (hrs)', 'Late (mins)'];
  const rows = reportData.map(employee => [
    employee.name,
    employee.position,
    employee.workingDays.toString(),
    employee.overtime.toFixed(2),
    employee.late.toString()
  ]);

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 30,
    theme: 'grid',
    margin: { top: 30 },
    styles: { fontSize: 12, valign: 'middle', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 50, halign: 'left' },
      1: { cellWidth: 50, halign: 'left' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 50, halign: 'center' },
      4: { cellWidth: 40, halign: 'center' },
    }
  });

  const yPosition = doc.autoTable.previous.finalY + 10;
  doc.text(`Total Working Days: ${totalWorkingDays}`, 20, yPosition);
  doc.text(`Total Overtime: ${totalOvertime.toFixed(2)} hours`, 20, yPosition + 10);
  doc.text(`Total Late: ${totalLate.toFixed(2)} minutes`, 20, yPosition + 20);

  doc.save(`attendance_report_${startDate}_to_${endDate}.pdf`);
}

