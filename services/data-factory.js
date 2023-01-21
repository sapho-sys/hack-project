/*CREATE TABLE my_employees(
  id SERIAL NOT NULL PRIMARY KEY,
  employee_name VARCHAR(40) NOT NULL
);

CREATE TABLE parking(
  id SERIAL NOT NULL PRIMARY KEY,
  spaces VARCHAR(40) NOT NULL
);

CREATE TABLE employee_shifts(
  id SERIAL NOT NULL PRIMARY KEY,
  employee_id INT NOT NULL,
  space_id INT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES my_employees(id),
  FOREIGN KEY (space_id) REFERENCES parking(id) 
);

INSERT INTO parking (spaces) VALUES ('Parking 1')
,('Parking 2'),('Parking 3'),('Parking 4'),('Parking 5')
,('Parking 6'),('Parking 7'); 
*/
function ParkingLots(db){
  
  const data = db;
  let errorMsg = '';
  let employeeName = '';
  let strName='';
  const RegExp = /^[A-Za-z]+$/;
  async function setEmployee(user) {
      employeeName = user.trim()
      try {
          if (employeeName !== '') {
              if (employeeName.match(RegExp)) {
                   strName = employeeName.charAt(0).toUpperCase() + employeeName.slice(1).toLowerCase();
                  await data.none('INSERT INTO my_employees (employee_name) VALUES ($1)', [strName]);
              }
          }
      } catch (error) {
          console.error('Somethin went wrong', error);
      }

  }

  function getEmployee() {
      return strName;
  }
  function errors() {
      return errorMsg;
  }

  async function retrieveData() {
      const tableRow = data.manyOrNone('SELECT * FROM my_employees');
      return tableRow;
  }

  async function employeeSchedule(schedule) {
      const employeeId = await employeeIdentity()
      const newEmployee = await data.manyOrNone('SELECT employee_id,space_id FROM waiter_shifts WHERE employee_id = $1', [employeeId]);
      if (newEmployee.length == 0) {
          await schedulePark(schedule, employeeId);
      } else {
          await data.query('DELETE FROM waiter_shifts WHERE employee_id = $1', [employeeId]);
          await schedulePark(schedule, employeeId);
      }
  }

  async function schedulePark(daySlot, todayId) {
      let parkId;
      let theParkId;
      if (Array.isArray(new Array(daySlot))) {
          for (const i of daySlot) {
              parkId = await data.manyOrNone('SELECT id FROM parking WHERE spaces = $1', [i]);
              theParkId = parkId[0].id;
              await data.manyOrNone('INSERT INTO waiter_shifts (employee_id, space_id) VALUES ($1,$2)', [todayId, theParkId]);
          }
      }
  }

  async function integrateData() {
      const strWaiters = await data.manyOrNone(`SELECT my_employees.employee_name, parking.spaces 
      FROM waiter_shifts
  INNER JOIN my_employees ON waiter_shifts.employee_id = my_employees.id
  INNER JOIN parking ON waiter_shifts.space_id = parking.id`);
      return strWaiters;

  }


  async function parkingSpace() {
      const theWeek = await data.manyOrNone('SELECT * FROM parking');
      return theWeek;
  }
  async function employeeIdentity() {
      const getId = await data.manyOrNone('SELECT id FROM my_employees WHERE employee_name = $1', [strName]);
      return getId[0].id;
  }
  async function shiftsSelected(waiter) {
      const theDays = await parkingSpace();
      const myEmployeeId = await data.manyOrNone(`SELECT id FROM
       my_employees WHERE employee_name = $1`,[waiter]);
       let workerId =myEmployeeId[0].id;
      for (const i of theDays) {
          const result = await data.manyOrNone('SELECT COUNT(*) FROM waiter_shifts WHERE employee_id = $1 and space_id = $2', [workerId, i.id]);
          const count = result[0].count;
          if (count > 0) {
              i.ticked = true;
          } else {
              i.ticked = false;
          }
      }
      return theDays;
  }

  async function deleteData(waiter) {
      const employeeID = await data.manyOrNone(`SELECT id FROM
       my_employees WHERE employee_name = $1`,[waiter])
       let waiterID = employeeID[0].id;
      const remove = await data.none(`DELETE FROM waiter_shifts WHERE employee_id = $1`, [waiterID]);
      const deleteId = await data.none('DELETE FROM my_employees WHERE id= $1', [waiterID]);
          
  }

  async function classListAddForShifts() {
      const eachDay = await parkingSpace();
      for (const day of eachDay) {
          const result = await data.manyOrNone('SELECT COUNT(*)  FROM waiter_shifts WHERE space_id = $1', [day.id]);
          console.log(result)
          const count = result[0].count;
          //add color to my slots based on shedules
          if (count < 3) {
              day.color = 'yellow';
          } else if (count == 3) {
              day.color = 'green';
          } else {
              day.color = 'red';
          }
      }
      return eachDay;
  }



  async function resetData() {
      errorMsg = "Your schedule data has been  cleared";
      return data.none('DELETE FROM my_employees');
  }

  return {
      setEmployee,
      errors,
      retrieveData,
      classListAddForShifts,
      shiftsSelected,
      schedulePark,
      integrateData,
      employeeSchedule,
      resetData,
      getEmployee,
      employeeIdentity,
      deleteData
  }

}
export default ParkingLots;
   