var counter = function (req, res) {
    res.render('index', {
        countryn: 94,
        delayn: 351,
        canceln: 50,
        sector: 'Energy'
    });
}

module.exports = {
    counter
}