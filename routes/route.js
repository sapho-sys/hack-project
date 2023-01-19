function carsRouters(dataFactory, db){
    async function defaultRoute(req, res){
        res.render('index');
    }
    async function postDriver(req, res){

    }
    async function getDriver(req, res){

    }

    async function postSlot(req, res){

    }

    async function getSlot(req, res){
        res.render('admin')
    }



    return {
        defaultRoute,
        postDriver,
        getDriver,
        postSlot,
        getSlot
    }
    
}

export default carsRouters