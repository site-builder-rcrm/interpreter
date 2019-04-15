var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var data = require('../private/config.json');

var BASE_URL = 'https://openapi.responsecrm.com/api/v2/open';
var API_GUID = data.funnel.responseKey;
var SITE_ID = data.funnel.responseSite;

function findNextRoute() {
    var step2component;
    Object.entries(data.components).forEach(function (compIdValue) {
        if (compIdValue[1].step && compIdValue[1].step === 2) {
            step2component = compIdValue[0];
        }
    });

    console.log(step2component);

    var step2route;
    Object.entries(data.routes).forEach(function (routeValue) {
        var route = routeValue[0];
        Object.entries(routeValue[1].containers).forEach(function (containerValue) {
            if (containerValue[1].includes(step2component)) {
                step2route = route;
            }
        })
    })

    console.log(step2route);

    return step2route;
}

/* GET users listing. */
router.post('/customer', function (req, res, next) {
    var d = req.body;
    d.SiteID = SITE_ID;
    customerId = req.cookies.CustomerID;
    rp({
        method: customerId ? 'PUT' : 'POST',
        uri: BASE_URL + '/customers' + (customerId ? ('/' + customerId) : ''),
        headers: {
            "content-type": "application/json",
            Authorization: "ApiGuid " + API_GUID
        },
        body: d,
        json: true
    }).then(function (response) {
        var nextRoute = findNextRoute();
        if (response.CustomerID) {
            res.cookie("CustomerID", response.CustomerID);
        }
        res.status(200).send({
            redirect: nextRoute
        });
    }).catch(function (response) {
        res.status(500).send(response);
    })
});
// router.put('/customer/:customerId', function (req, res, next) {
//     var data = req.body;
//     data.SiteID = SITE_ID;
//     rp({
//         method: 'POST',
//         uri: BASE_URL + '/customers/' + req.params.customerId,
//         headers: {
//             "content-type": "application/json",
//             Authorization: "ApiGuid " + API_GUID
//         },
//         body: data,
//         json: true
//     }).then(function (response) {
//         res.status(200).send(response);
//     }).catch(function (response) {
//         res.status(500).send(response);
//     })
// });
router.post('/customer/:customerId/bill', function (req, res, next) {
    console.log(req);
    res.status(200).send();
});

module.exports = router;