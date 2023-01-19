
function theParkers(db) {
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
        const employeeId = await waiterIdentity()
        const newEmployee = await data.manyOrNone('SELECT employee_id,slot_id FROM employee_shifts WHERE employee_id = $1', [employeeId]);
        if (newEmployee.length == 0) {
            await schedulePark(schedule, employeeId);
        } else {
            await data.query('DELETE FROM waiter_shifts WHERE waiter_id = $1', [employeeId]);
            await schedulePark(schedule, employeeId);
        }
    }

    async function schedulePark(weeklyShifts, todayId) {
        let dayId;
        let theDayId;
        if (Array.isArray(new Array(weeklyShifts))) {
            for (const i of weeklyShifts) {
                dayId = await data.manyOrNone('SELECT id FROM weekdays WHERE shifts = $1', [i]);
                theDayId = dayId[0].id;
                await data.manyOrNone('INSERT INTO waiter_shifts (waiter_id, shift_id) VALUES ($1,$2)', [todayId, theDayId]);
            }
        }
    }

    async function integrateData() {
        const strWaiters = await data.manyOrNone(`SELECT my_waiters.waiter_name, weekdays.shifts 
        FROM waiter_shifts
		INNER JOIN my_waiters ON waiter_shifts.waiter_id = my_waiters.id
		INNER JOIN weekdays ON waiter_shifts.shift_id = weekdays.id`);
        return strWaiters;

    }


    async function weekDays() {
        const theWeek = await data.manyOrNone('SELECT * FROM weekdays');
        return theWeek;
    }
    async function employeeIdentity() {
        const getId = await data.manyOrNone('SELECT id FROM my_waiters WHERE waiter_name = $1', [strName]);
        return getId[0].id;
    }
    async function shiftsSelected(waiter) {
        const theDays = await weekDays();
        const myWaiterId = await data.manyOrNone(`SELECT id FROM
         my_waiters WHERE waiter_name = $1`,[waiter]);
         let herWaiterId =myWaiterId[0].id;
        for (const i of theDays) {
            const result = await data.manyOrNone('SELECT COUNT(*) FROM waiter_shifts WHERE waiter_id = $1 and shift_id = $2', [herWaiterId, i.id]);
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
         my_waiters WHERE waiter_name = $1`,[waiter])
         let waiterID = employeeID[0].id;
        const remove = await data.none(`DELETE FROM waiter_shifts WHERE waiter_id = $1`, [waiterID]);
        const deleteId = await data.none('DELETE FROM my_waiters WHERE id= $1', [waiterID]);
            
    }

    async function classListAddForShifts() {
        const eachDay = await weekDays();
        for (const day of eachDay) {
            const result = await data.manyOrNone('SELECT COUNT(*)  FROM car_slots WHERE slot_id = $1', [day.id]);
            // console.log(result)
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
        return data.none('DELETE FROM cars_slots');
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

export default theParkers;