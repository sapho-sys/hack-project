function carsRouters(dataFactory, db){
    async function defaultRoute(req, res){
        res.render('index',{
            driverSlot:  dataFactory.retrieveData()
        })
    }
    async function postDriver(req, res) {
        let entry = req.body.username;
        const sqlDuplicates = await db.manyOrNone('SELECT COUNT(*) FROM my_employees WHERE employee_name = $1', [entry]);
        if (sqlDuplicates[0].count >= 1) {
            req.flash('error', 'This driver has already been scheduled for the day');
            res.redirect('/');
        } else if (!entry) {
            req.flash('error', 'Provide us with your name before we proceed');
            res.redirect('/');
        } else {
            await dataFactory.setEmployee(entry);
            let driver = dataFactory.getEmployee();
            res.redirect(`drivers/${driver}`);
        }

    }
    async function getUI(req,res){
        res.render('drivers')
    }


    async function getDriver(req, res) {
        let driver = dataFactory.getEmployee();
        let driverSlot = await dataFactory.shiftsSelected(driver);
        res.render('drivers', {
            driver,
            driverSlot
        })

    }

    async function postSlot(req, res) {
        try {
            let strDriver = dataFactory.getEmployee();
            let parkSlot = req.body.checkPark;
            let days = Array.isArray(parkSlot) ? parkSlot : [parkSlot];
            var numOfTrue = days.filter(function (item) { return typeof item === "string"; }).length
            if (numOfTrue ===  1) {
                req.flash('success', 'Successfuly updated.');
                await dataFactory.employeeSchedule(days);
            } else if (numOfTrue <= 1) {
                req.flash('error', 'Please select at least one parking slots before we proceed.');
            }
            res.redirect(`drivers/${strDriver}`);

        } catch (error) {
            console.log(`Here is my bug:`, error)

        }

    }

    async function getSlot(req, res) {
       
        const myTable = await dataFactory.integrateData()
        console.log("Database;", myTable);
  
        // here I configure the arrays I will work with for each parking
        const Parking1 = [];
        const Parking2 = [];
        const Parking3 = [];
        const Parking4 = [];
        const Parking5 = [];
        const Parking6 = [];
        const Addcolor = await dataFactory.classListAddForShifts();
        // puttin my arrays to use by pushing the names of the waiters 
        for (const i of myTable) {
            switch (true) {
                case (i.spaces.includes('Parking 1')):
                    Parking1.push(i.employee_name)
                    console.log('Parking car:,',Parking1);
                    break
                case (i.spaces.includes('Parking 2')):
                    Parking2.push(i.employee_name)
                    break
                case (i.spaces.includes('Parking 3')):
                    Parking3.push(i.employee_name)
                    break
                case (i.spaces.includes('Parking 4')):
                    Parking4.push(i.employee_name)
                    break
                case (i.spaces.includes('Parking 5')):
                    Parking5.push(i.employee_name)
                    break
                case (i.spaces.includes('Parking 6')):
                    Parking6.push(i.employee_name)
                    break
            }

        }
        res.render('admin', {
            // user: req.session.userLogin,
            Parking1,
            Parking2,
            Parking3,
            Parking4,
            Parking5,
            Parking6,
            Addcolor,
            waiterNames: await dataFactory.retrieveData()

        });
    }

    async function deleteUser(req, res) {
        const user = req.body.waiter;
        try {
            // console.log(`Here is the waiter id`, user);

            await dataFactory.deleteData(user);
            req.flash('success', `${user} has been deleted from the parking lot`);

            res.redirect('back');
        } catch (error) {
            console.log("Here is the bug", error);
        }


    }

    return {
        defaultRoute,
        postDriver,
        getDriver,
        postSlot,
        getSlot,
        getUI,
        deleteUser
    }
    
}

export default carsRouters